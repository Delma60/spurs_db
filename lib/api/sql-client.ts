// Client-safe wrapper over the internal SQL API. Never imports server DB code.
const base = "/api/internal/sql";

export type ColumnType = "text" | "integer" | "number" | "boolean" | "datetime" | "json";

export const TYPE_OPTIONS: { value: ColumnType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "integer", label: "Integer" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "datetime", label: "Date & time" },
  { value: "json", label: "JSON" },
];

export interface TableInfo {
  name: string;
  columns: number;
}
export interface Column {
  name: string;
  dataType: string;
  nullable: boolean;
}
export interface NewColumn {
  name: string;
  type: ColumnType;
  nullable: boolean;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchTables(project: string): Promise<TableInfo[]> {
  return (await json<{ tables: TableInfo[] }>(await fetch(`${base}/tables?project=${project}`))).tables;
}

export async function createTable(project: string, name: string, columns: NewColumn[]): Promise<void> {
  await json(
    await fetch(`${base}/tables?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, columns }),
    }),
  );
}

export async function dropTable(project: string, table: string): Promise<void> {
  await json(await fetch(`${base}/tables/${table}?project=${project}`, { method: "DELETE" }));
}

export async function fetchRows(
  project: string,
  table: string,
): Promise<{ columns: Column[]; rows: Record<string, unknown>[] }> {
  return json(await fetch(`${base}/rows?project=${project}&table=${table}`));
}

export async function insertRow(
  project: string,
  table: string,
  values: Record<string, unknown>,
): Promise<void> {
  await json(
    await fetch(`${base}/rows?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, values }),
    }),
  );
}

export async function deleteRow(project: string, table: string, id: string): Promise<void> {
  await json(
    await fetch(`${base}/rows?project=${project}&table=${table}&id=${id}`, { method: "DELETE" }),
  );
}

export async function addColumn(project: string, table: string, col: NewColumn): Promise<void> {
  await json(
    await fetch(`${base}/tables/${table}/columns?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(col),
    }),
  );
}

export async function dropColumn(project: string, table: string, column: string): Promise<void> {
  await json(
    await fetch(`${base}/tables/${table}/columns?project=${project}&column=${column}`, {
      method: "DELETE",
    }),
  );
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export async function runQuery(project: string, query: string): Promise<QueryResult> {
  return json<QueryResult>(
    await fetch(`${base}/query?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  );
}
