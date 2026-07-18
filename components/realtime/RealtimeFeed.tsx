"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, Zap } from "lucide-react";

interface RtEvent {
  id: number;
  table: string;
  op: string;
  row: Record<string, unknown>;
  at: string;
}

const OP_STYLE: Record<string, string> = {
  INSERT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function RealtimeFeed({ project }: { project: string }) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<RtEvent[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const es = new EventSource(`/api/internal/realtime/subscribe?project=${project}`);
    es.addEventListener("ready", () => setConnected(true));
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((cur) =>
          [
            { id: ++idRef.current, table: data.table, op: data.op, row: data.row, at: new Date().toLocaleTimeString() },
            ...cur,
          ].slice(0, 50),
        );
      } catch {
        /* ignore heartbeats / malformed */
      }
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [project]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Realtime</h1>
          <p className="mt-1 text-sm text-zinc-500">Subscribe to live data changes</p>
        </div>
        <span
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
          }`}
        >
          <Radio size={13} className={connected ? "animate-pulse" : ""} />
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        Insert, update or delete a row in <span className="text-zinc-300">Database</span> and it appears here instantly.
      </p>

      <div className="mt-4 space-y-2">
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
            <Zap className="mx-auto text-zinc-600" size={28} />
            <p className="mt-3 text-sm text-zinc-500">Waiting for changes…</p>
          </div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${OP_STYLE[e.op] ?? "border-zinc-700 text-zinc-400"}`}>
                {e.op}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-zinc-300">
                  <span className="font-medium text-zinc-100">{e.table}</span>
                </div>
                <pre className="mt-1 overflow-x-auto text-xs text-zinc-500">{JSON.stringify(e.row)}</pre>
              </div>
              <span className="whitespace-nowrap text-xs text-zinc-600">{e.at}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
