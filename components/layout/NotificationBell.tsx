"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";

interface Item {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/internal/notifications");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items);
      setUnread(json.unread);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial unread count + light polling.
  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await load();
  }

  async function markAll() {
    await fetch("/api/internal/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
    setUnread(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
            <span className="text-sm font-medium text-zinc-200">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-amber-400 hover:text-amber-300">Mark all read</button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex justify-center py-8 text-zinc-500"><Loader2 className="animate-spin" size={18} /></div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => {
                const inner = (
                  <div className={`flex gap-3 px-4 py-3 ${n.read ? "" : "bg-amber-500/[0.04]"}`}>
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                    <div className={`min-w-0 ${n.read ? "pl-[18px]" : ""}`}>
                      <p className="text-sm text-zinc-200">{n.title}</p>
                      {n.body && <p className="mt-0.5 text-xs text-zinc-500">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-zinc-600">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block hover:bg-zinc-800/50">
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id} className="border-t border-zinc-800/60 first:border-0">{inner}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
