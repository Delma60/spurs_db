"use client";

import { useCallback, useEffect, useState } from "react";
import { Table2, Trash2, Plus, X, Loader2, Database, Terminal } from "lucide-react";
import AddTableDialog from "./AddTableDialog";
import SqlEditor from "./SqlEditor";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import {
  fetchTables, fetchRows, dropTable, insertRow, deleteRow, addColumn, dropColumn,
  TYPE_OPTIONS, type TableInfo, type Column, type NewColumn,
} from "@/lib/api/sql-client";

const AUTO = new Set(["id", "created_at"]);

function coerce(dataType: string, raw: unknown): unknown {
  if (raw === "" || raw == null) return undefined;
  if (dataType === "boolean") return raw === true || raw === "true";
  if (dataType === "integer" || dataType === "numeric") return Number(raw);
  if (dataType === "jsonb") return JSON.parse(String(raw));
  return raw;
}

export default function DatabaseClient({ project }: { project: string }) {
  const confirm = useConfirm();
  const [mode, setMode] = useState<"tables" | "sql">("tables");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [addingCol, setAddingCol] = useState(false);
  const [colDraft, setColDraft] = useState<NewColumn>({ name: "", type: "text", nullable: true });

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const t = await fetchTables(project);
      setTables(t);
      setSelected((cur) => cur ?? t[0]?.name ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  const loadRows = useCallback(async (table: string) => {
    setError(null);
    try {
      const { columns, rows } = await fetchRows(project, table);
      setColumns(columns);
      setRows(rows);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [project]);

  useEffect(() => { loadTables(); }, [loadTables]);
  useEffect(() => { if (selected) loadRows(selected); }, [selected, loadRows]);

  const editable = columns.filter((c) => !AUTO.has(c.name));

  const saveRow = async () => {
    if (!selected) return;
    setError(null);
    try {
      const values: Record<string, unknown> = {};
      for (const c of editable) {
        const v = coerce(c.dataType, draft[c.name]);
        if (v !== undefined) values[c.name] = v;
      }
      await insertRow(project, selected, values);
      setDraft({});
      setAdding(false);
      await loadRows(selected);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const saveColumn = async () => {
    if (!selected || !colDraft.name.trim()) return;
    setError(null);
    try {
      await addColumn(project, selected, colDraft);
      setColDraft({ name: "", type: "text", nullable: true });
      setAddingCol(false);
      await loadRows(selected);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const removeColumn = async (name: string) => {
    if (!selected || !(await confirm({ title: "Drop column", message: `Drop column "${name}"? Its data will be lost.`, danger: true, confirmLabel: "Drop" }))) return;
    try {
      await dropColumn(project, selected, name);
      await loadRows(selected);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const removeRow = async (id: string) => {
    if (!selected || !(await confirm({ title: "Delete row", message: "Delete this row? This can’t be undone.", danger: true, confirmLabel: "Delete" }))) return;
    await deleteRow(project, selected, id);
    await loadRows(selected);
  };

  const removeTable = async (name: string) => {
    if (!(await confirm({ title: "Delete table", message: `Delete table "${name}" and all its data? This can’t be undone.`, danger: true, confirmLabel: "Delete table" }))) return;
    await dropTable(project, name);
    setSelected(null);
    setColumns([]);
    setRows([]);
    await loadTables();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Database</h1>
          <p className="mt-1 text-sm text-zinc-500">Tables with instant, secure APIs</p>
        </div>
        {mode === "tables" && <AddTableDialog project={project} onCreated={loadTables} />}
      </div>

      {/* Tabs */}
      <div className="mt-5 inline-flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1 text-sm">
        <button
          onClick={() => setMode("tables")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${mode === "tables" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <Table2 size={15} /> Tables
        </button>
        <button
          onClick={() => setMode("sql")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${mode === "sql" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <Terminal size={15} /> SQL editor
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
      )}

      {mode === "sql" ? (
        <div className="mt-6"><SqlEditor project={project} /></div>
      ) : loading ? (
        <div className="mt-16 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
      ) : tables.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <Database className="mx-auto text-zinc-600" size={30} />
          <p className="mt-3 text-zinc-300">No tables yet.</p>
          <p className="mt-1 text-sm text-zinc-600">Create your first table to store data.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[200px_1fr] gap-6">
          <div className="space-y-1">
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelected(t.name)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  selected === t.name ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <Table2 size={15} />
                <span className="truncate">{t.name}</span>
                <span className="ml-auto text-xs text-zinc-600">{t.columns}</span>
              </button>
            ))}
          </div>

          <div className="min-w-0">
            {selected && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Table2 size={16} className="text-amber-400" /> {selected}
                    <span className="text-xs text-zinc-500">· {rows.length} rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setAddingCol((a) => !a); setAdding(false); }} className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-200 transition hover:bg-zinc-800">
                      <Plus size={14} /> Column
                    </button>
                    <button onClick={() => { setAdding((a) => !a); setAddingCol(false); }} className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-200 transition hover:bg-zinc-800">
                      <Plus size={14} /> Add row
                    </button>
                    <button onClick={() => removeTable(selected)} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-red-500/40 hover:text-red-400" title="Delete table">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {addingCol && (
                  <div className="mt-4 flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-zinc-400">Column name</label>
                      <input value={colDraft.name} onChange={(e) => setColDraft((d) => ({ ...d, name: e.target.value }))} placeholder="column_name"
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">Type</label>
                      <select value={colDraft.type} onChange={(e) => setColDraft((d) => ({ ...d, type: e.target.value as NewColumn["type"] }))}
                        className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-amber-500">
                        {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <label className="flex h-9 items-center gap-1 text-xs text-zinc-400">
                      <input type="checkbox" checked={!colDraft.nullable} onChange={(e) => setColDraft((d) => ({ ...d, nullable: !e.target.checked }))} /> Req
                    </label>
                    <button onClick={saveColumn} className="h-9 rounded-lg bg-amber-500 px-3 text-sm font-medium text-black hover:bg-amber-400">Add</button>
                  </div>
                )}

                {adding && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {editable.map((c) => (
                        <div key={c.name}>
                          <label className="mb-1 block text-xs text-zinc-400">{c.name} <span className="ml-1 text-zinc-600">{c.dataType}</span></label>
                          {c.dataType === "boolean" ? (
                            <input type="checkbox" checked={!!draft[c.name]} onChange={(e) => setDraft((d) => ({ ...d, [c.name]: e.target.checked }))} />
                          ) : (
                            <input
                              type={c.dataType === "integer" || c.dataType === "numeric" ? "number" : c.dataType.startsWith("timestamp") ? "datetime-local" : "text"}
                              value={(draft[c.name] as string) ?? ""}
                              onChange={(e) => setDraft((d) => ({ ...d, [c.name]: e.target.value }))}
                              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button onClick={() => { setAdding(false); setDraft({}); }} className="h-8 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                      <button onClick={saveRow} className="h-8 rounded-lg bg-amber-500 px-3 text-sm font-medium text-black hover:bg-amber-400">Save row</button>
                    </div>
                  </div>
                )}

                <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400">
                        {columns.map((c) => (
                          <th key={c.name} className="group whitespace-nowrap px-4 py-2.5 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              {c.name}
                              {!AUTO.has(c.name) && (
                                <button onClick={() => removeColumn(c.name)} className="opacity-0 transition group-hover:opacity-100 hover:text-red-400" title="Drop column">
                                  <X size={12} />
                                </button>
                              )}
                            </span>
                          </th>
                        ))}
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-zinc-600">No rows yet.</td></tr>
                      ) : (
                        rows.map((row) => (
                          <tr key={String(row.id)} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                            {columns.map((c) => (
                              <td key={c.name} className="max-w-xs truncate px-4 py-2.5 text-zinc-300">{formatCell(row[c.name])}</td>
                            ))}
                            <td className="px-2">
                              <button onClick={() => removeRow(String(row.id))} className="grid h-7 w-7 place-items-center rounded text-zinc-600 hover:text-red-400" title="Delete row">
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}
