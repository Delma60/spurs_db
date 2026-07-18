"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { runQuery, type QueryResult } from "@/lib/api/sql-client";

export default function SqlEditor({ project }: { project: string }) {
  const [query, setQuery] = useState("select * from ");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      setResult(await runQuery(project, query));
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
          spellCheck={false}
          rows={7}
          className="w-full resize-y bg-transparent p-4 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          placeholder="select * from my_table"
        />
        <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
          <span className="text-xs text-zinc-600">Runs sandboxed to this project · ⌘/Ctrl + Enter</span>
          <button
            onClick={run}
            disabled={running}
            className="flex h-8 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div className="mb-2 text-xs text-zinc-500">
            {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
          </div>
          {result.columns.length === 0 ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Query ran successfully.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400">
                    {result.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-4 py-2.5 font-medium">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                      {result.columns.map((c) => (
                        <td key={c} className="max-w-xs truncate px-4 py-2.5 text-zinc-300">
                          {formatCell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
