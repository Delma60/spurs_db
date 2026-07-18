"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, Check, Plus } from "lucide-react";

interface Item {
  id: string;
  name: string;
}

export default function ProjectSwitcher({
  userId,
  projects,
  currentId,
}: {
  userId: string;
  projects: Item[];
  currentId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = projects.find((p) => p.id === currentId);

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
      <span className="mx-1 text-zinc-700">/</span>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
      >
        {current?.name ?? "Project"}
        <ChevronsUpDown size={14} className="text-zinc-500" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-60 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-xl">
          <div className="px-2 py-1 text-xs uppercase tracking-wide text-zinc-600">Projects</div>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/u/${userId}/project/${p.id}/overview`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              <span className="truncate">{p.name}</span>
              {p.id === currentId && <Check size={15} className="text-amber-400" />}
            </Link>
          ))}
          <Link
            href={`/u/${userId}`}
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 border-t border-zinc-800 px-2.5 pt-2.5 pb-1 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <Plus size={15} /> All projects
          </Link>
        </div>
      )}
    </div>
  );
}
