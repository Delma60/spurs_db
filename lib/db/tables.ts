// Per-project Database service. Each project gets its own Postgres schema on
// the shared cluster; tables/rows live there. All identifiers are validated
// (they can't be parameterized), all values are parameterized.
import { sql } from "./index";

/** Friendly column type → Postgres type. UI never shows the right-hand side. */
export const COLUMN_TYPES = {
  text: "text",
  number: "numeric",
  integer: "integer",
  boolean: "boolean",
  datetime: "timestamptz",
  json: "jsonb",
} as const;

export type ColumnType = keyof typeof COLUMN_TYPES;

export interface ColumnDef {
  name: string;
  type: ColumnType;
  nullable: boolean;
}

const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;

function assertIdent(name: string): string {
  if (!IDENT.test(name)) {
    throw new Error(
      `Invalid name "${name}". Use lowercase letters, numbers and underscores, starting with a letter.`,
    );
  }
  return name;
}

/** Deterministic, safe schema + role names for a project. */
export function schemaName(projectId: string): string {
  return "p_" + projectId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 24);
}
export function roleName(projectId: string): string {
  return "r_" + projectId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 24);
}

/**
 * Ensure the project's schema AND its sandbox role exist. The role can touch
 * only this schema — used to run the (untrusted) SQL editor safely on shared
 * infra. The connection owner is made a member so the console's own CRUD keeps
 * full access via inheritance.
 */
export async function ensureSchema(projectId: string): Promise<void> {
  const s = schemaName(projectId);
  const r = roleName(projectId);
  await sql.unsafe(`create schema if not exists "${s}"`);
  await sql.unsafe(
    `do $$ begin if not exists (select from pg_roles where rolname='${r}') then create role "${r}" nologin; end if; end $$;`,
  );
  await sql.unsafe(`grant usage, create on schema "${s}" to "${r}"`);
  await sql.unsafe(`grant all on all tables in schema "${s}" to "${r}"`);
  await sql.unsafe(`grant all on all sequences in schema "${s}" to "${r}"`);
  await sql.unsafe(`alter default privileges in schema "${s}" grant all on tables to "${r}"`);
  await sql.unsafe(`grant "${r}" to current_user`);
}

export interface TableInfo {
  name: string;
  columns: number;
}

export async function listTables(projectId: string): Promise<TableInfo[]> {
  const s = schemaName(projectId);
  const rows = await sql<{ name: string; columns: string }[]>`
    select t.table_name as name,
           count(c.column_name)::int as columns
    from information_schema.tables t
    join information_schema.columns c
      on c.table_schema = t.table_schema and c.table_name = t.table_name
    where t.table_schema = ${s} and t.table_type = 'BASE TABLE'
    group by t.table_name
    order by t.table_name`;
  return rows.map((r) => ({ name: r.name, columns: Number(r.columns) }));
}

export async function createTable(
  projectId: string,
  name: string,
  columns: ColumnDef[],
): Promise<void> {
  await ensureSchema(projectId);
  const s = schemaName(projectId);
  assertIdent(name);

  const parts = ['"id" uuid primary key default gen_random_uuid()'];
  for (const col of columns) {
    assertIdent(col.name);
    const pgType = COLUMN_TYPES[col.type];
    if (!pgType) throw new Error(`Unknown type: ${col.type}`);
    parts.push(`"${col.name}" ${pgType}${col.nullable ? "" : " not null"}`);
  }
  parts.push('"created_at" timestamptz not null default now()');

  await sql.unsafe(`create table "${s}"."${name}" (${parts.join(", ")})`);
  await ensureTrigger(s, name);
}

/**
 * Emit a NOTIFY on every row change so Realtime subscribers see live updates.
 * Channel = the project schema name; payload = { table, op, row }.
 */
async function ensureTrigger(schema: string, table: string): Promise<void> {
  await sql.unsafe(
    `create or replace function "${schema}".__notify() returns trigger as $fn$
     begin
       perform pg_notify('${schema}', json_build_object(
         'table', tg_table_name, 'op', tg_op, 'row', row_to_json(coalesce(new, old))
       )::text);
       return coalesce(new, old);
     end; $fn$ language plpgsql;`,
  );
  await sql.unsafe(`drop trigger if exists __rt on "${schema}"."${table}"`);
  await sql.unsafe(
    `create trigger __rt after insert or update or delete on "${schema}"."${table}"
     for each row execute function "${schema}".__notify()`,
  );
}

export async function dropTable(projectId: string, table: string): Promise<void> {
  const s = schemaName(projectId);
  assertIdent(table);
  await sql.unsafe(`drop table if exists "${s}"."${table}"`);
}

export interface Column {
  name: string;
  dataType: string;
  nullable: boolean;
}

export async function listColumns(projectId: string, table: string): Promise<Column[]> {
  const s = schemaName(projectId);
  assertIdent(table);
  const rows = await sql<{ column_name: string; data_type: string; is_nullable: string }[]>`
    select column_name, data_type, is_nullable
    from information_schema.columns
    where table_schema = ${s} and table_name = ${table}
    order by ordinal_position`;
  return rows.map((r) => ({
    name: r.column_name,
    dataType: r.data_type,
    nullable: r.is_nullable === "YES",
  }));
}

export async function listRows(
  projectId: string,
  table: string,
  limit = 100,
): Promise<Record<string, unknown>[]> {
  const s = schemaName(projectId);
  assertIdent(table);
  const lim = Math.min(Math.max(1, Math.floor(limit)), 500);
  return sql.unsafe(`select * from "${s}"."${table}" order by created_at desc limit ${lim}`);
}

export async function insertRow(
  projectId: string,
  table: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const s = schemaName(projectId);
  assertIdent(table);

  const cols = Object.keys(data).filter((k) => k !== "id" && k !== "created_at");
  cols.forEach(assertIdent);
  if (cols.length === 0) throw new Error("No values provided.");

  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const values = cols.map((c) => data[c]);

  const [row] = await sql.unsafe(
    `insert into "${s}"."${table}" (${colList}) values (${placeholders}) returning *`,
    values as never[],
  );
  return row as Record<string, unknown>;
}

export async function deleteRow(projectId: string, table: string, id: string): Promise<void> {
  const s = schemaName(projectId);
  assertIdent(table);
  await sql.unsafe(`delete from "${s}"."${table}" where id = $1`, [id] as never[]);
}

export async function updateRow(
  projectId: string,
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const s = schemaName(projectId);
  assertIdent(table);

  const cols = Object.keys(data).filter((k) => k !== "id" && k !== "created_at");
  cols.forEach(assertIdent);
  if (cols.length === 0) throw new Error("No fields to update.");

  const set = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ");
  const values = [...cols.map((c) => data[c]), id];
  const [row] = await sql.unsafe(
    `update "${s}"."${table}" set ${set} where id = $${cols.length + 1} returning *`,
    values as never[],
  );
  return (row as Record<string, unknown>) ?? null;
}

/** List rows with optional equality filters (each key must be a real column). */
export async function queryRows(
  projectId: string,
  table: string,
  filters: Record<string, string>,
  limit = 100,
): Promise<Record<string, unknown>[]> {
  const s = schemaName(projectId);
  assertIdent(table);
  const lim = Math.min(Math.max(1, Math.floor(limit)), 500);

  const cols = Object.keys(filters);
  if (cols.length === 0) return listRows(projectId, table, lim);
  cols.forEach(assertIdent);

  const where = cols.map((c, i) => `"${c}" = $${i + 1}`).join(" and ");
  const values = cols.map((c) => filters[c]);
  return sql.unsafe(
    `select * from "${s}"."${table}" where ${where} order by created_at desc limit ${lim}`,
    values as never[],
  );
}

// ---- Column alter ----

export async function addColumn(projectId: string, table: string, col: ColumnDef): Promise<void> {
  const s = schemaName(projectId);
  assertIdent(table);
  assertIdent(col.name);
  const pgType = COLUMN_TYPES[col.type];
  if (!pgType) throw new Error(`Unknown type: ${col.type}`);
  await sql.unsafe(
    `alter table "${s}"."${table}" add column "${col.name}" ${pgType}${col.nullable ? "" : " not null"}`,
  );
}

export async function dropColumn(projectId: string, table: string, column: string): Promise<void> {
  const s = schemaName(projectId);
  assertIdent(table);
  assertIdent(column);
  if (column === "id" || column === "created_at") {
    throw new Error("The id and created_at columns can’t be removed.");
  }
  await sql.unsafe(`alter table "${s}"."${table}" drop column "${column}"`);
}

// ---- SQL editor (sandboxed to the project's schema via its role) ----

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export async function runSql(projectId: string, query: string): Promise<QueryResult> {
  await ensureSchema(projectId);
  const s = schemaName(projectId);
  const r = roleName(projectId);

  return sql.begin(async (tx) => {
    // Drop to the sandbox role + scope name resolution to this schema.
    await tx.unsafe(`set local role "${r}"`);
    await tx.unsafe(`set local search_path to "${s}"`);

    const result = (await tx.unsafe(query)) as unknown as Record<string, unknown>[] & {
      columns?: { name: string }[];
      count?: number;
    };
    const rows = Array.isArray(result) ? [...result] : [];
    const columns = result.columns?.map((c) => c.name) ?? (rows[0] ? Object.keys(rows[0]) : []);
    return { columns, rows: rows.slice(0, 500), rowCount: result.count ?? rows.length };
  }) as Promise<QueryResult>;
}
