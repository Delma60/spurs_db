"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Loader2, Plus, X, ChevronRight, ChevronDown, Radio } from "lucide-react";
import { fetchTree, setPath, removePath } from "@/lib/api/rtdb-client";

function parseValue(raw: string): unknown {
  const t = raw.trim();
  if (t === "") return "";
  try {
    return JSON.parse(t);
  } catch {
    return raw;
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default function RealtimeDatabase({ project, rootUrl }: { project: string; rootUrl: string }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await fetchTree(project));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const es = new EventSource(`/api/internal/realtimedb/subscribe?project=${project}`);
    es.addEventListener("ready", () => setLive(true));
    es.onmessage = () => load();
    es.onerror = () => setLive(false);
    return () => es.close();
  }, [project, load]);

  const write = async (path: string, value: unknown) => {
    setError(null);
    try {
      await setPath(project, path, value);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const del = async (path: string) => {
    setError(null);
    try {
      await removePath(project, path);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Realtime Database</h1>
        <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${live ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 bg-zinc-800/50 text-zinc-400"}`}>
          <Radio size={13} className={live ? "animate-pulse" : ""} /> {live ? "Live" : "Connecting…"}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">A JSON tree that syncs live across every connected client.</p>

      {/* URL bar */}
      <div className="mt-5 flex items-center gap-2 rounded-t-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <Link2 size={15} className="text-zinc-500" />
        <span className="truncate font-mono text-sm text-zinc-300">{rootUrl}</span>
      </div>

      {/* Tree */}
      <div className="rounded-b-xl border border-t-0 border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
        {loading ? (
          <Loader2 className="animate-spin text-zinc-500" size={18} />
        ) : (
          <TreeNode name={rootUrl} value={data} path="" isRoot onWrite={write} onDelete={del} />
        )}
      </div>
      {error && <p className="mt-2 font-mono text-sm text-red-400">{error}</p>}
    </div>
  );
}

function TreeNode({
  name, value, path, isRoot, onWrite, onDelete,
}: {
  name: string;
  value: unknown;
  path: string;
  isRoot?: boolean;
  onWrite: (path: string, value: unknown) => void;
  onDelete: (path: string) => void;
}) {
  const object = isObj(value);
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  const [edit, setEdit] = useState("");

  const childPath = (key: string) => (path ? `${path}/${key}` : key);

  const addChild = () => {
    if (!k.trim()) return;
    onWrite(childPath(k.trim()), parseValue(v));
    setK(""); setV(""); setAdding(false); setOpen(true);
  };
  const saveEdit = () => { onWrite(path, parseValue(edit)); setEditing(false); };

  return (
    <div className={isRoot ? "" : "ml-4 border-l border-zinc-800 pl-3"}>
      <div className="group flex items-center gap-1.5 py-0.5">
        {object ? (
          <button onClick={() => setOpen((o) => !o)} className="text-zinc-500">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}

        <span className={isRoot ? "text-zinc-400" : "text-sky-300"}>{name}</span>
        <span className="text-zinc-600">{isRoot ? "/" : ""}:</span>

        {!object &&
          (editing ? (
            <input
              autoFocus
              value={edit}
              onChange={(e) => setEdit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              onBlur={saveEdit}
              className="rounded border border-amber-500 bg-zinc-900 px-1.5 py-0.5 text-emerald-300 outline-none"
            />
          ) : (
            <button
              onClick={() => { setEdit(typeof value === "string" ? value : JSON.stringify(value)); setEditing(true); }}
              className="text-emerald-300 hover:underline"
            >
              {value === null ? "null" : typeof value === "string" ? `"${value}"` : String(value)}
            </button>
          ))}

        {/* controls */}
        <span className="ml-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {(object || value === null) && (
            <button onClick={() => { setAdding(true); setOpen(true); }} className="text-zinc-500 hover:text-amber-400" title="Add child">
              <Plus size={13} />
            </button>
          )}
          {!isRoot && (
            <button onClick={() => onDelete(path)} className="text-zinc-500 hover:text-red-400" title="Delete">
              <X size={13} />
            </button>
          )}
        </span>
      </div>

      {adding && (
        <div className="ml-4 flex items-center gap-1.5 py-1">
          <input autoFocus value={k} onChange={(e) => setK(e.target.value)} placeholder="key" className="w-24 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-sky-300 outline-none focus:border-amber-500" />
          <span className="text-zinc-600">:</span>
          <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChild()} placeholder='value or {}' className="w-40 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-emerald-300 outline-none focus:border-amber-500" />
          <button onClick={addChild} className="rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-black">Add</button>
          <button onClick={() => setAdding(false)} className="text-zinc-500 hover:text-zinc-300"><X size={13} /></button>
        </div>
      )}

      {object && open &&
        Object.entries(value as Record<string, unknown>).map(([key, val]) => (
          <TreeNode key={key} name={key} value={val} path={childPath(key)} onWrite={onWrite} onDelete={onDelete} />
        ))}

      {isRoot && value === null && !adding && (
        <div className="ml-4 py-1 text-zinc-600">null — hover the root and click + to add data</div>
      )}
    </div>
  );
}
