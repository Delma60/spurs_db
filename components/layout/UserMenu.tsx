"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";

export default function UserMenu({ name, email }: { name?: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (name || email || "?").charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-full bg-zinc-800 text-sm font-medium transition hover:bg-zinc-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-xl">
          <div className="border-b border-zinc-800 px-3 pb-2.5 pt-1.5">
            <div className="truncate text-sm font-medium text-zinc-100">{name}</div>
            <div className="truncate text-xs text-zinc-500">{email}</div>
          </div>
          <a
            href="http://localhost:8000/me"
            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            <UserIcon size={15} /> Spurs account
          </a>
          <a
            href="/auth/logout"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            <LogOut size={15} /> Sign out
          </a>
        </div>
      )}
    </div>
  );
}
