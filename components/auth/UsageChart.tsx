"use client";

import { Users as UsersIcon, LogIn, ShieldCheck } from "lucide-react";
import type { EndUser } from "@/lib/api/auth-users-client";

// Single-series, change-over-time: one accent hue (amber), rounded bar tops on a
// baseline, recessive axis, per-bar hover tooltip, no legend (title names it).
export default function UsageChart({ users, providersEnabled }: { users: EndUser[]; providersEnabled: number }) {
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - (13 - idx));
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = users.filter((u) => {
      const t = new Date(u.createdAt);
      return t >= d && t < next;
    }).length;
    return { date: d, count, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
  const max = Math.max(1, ...days.map((d) => d.count));

  const stats = [
    { icon: UsersIcon, label: "Total users", value: users.length },
    { icon: LogIn, label: "Signed in", value: users.filter((u) => u.lastSignInAt).length },
    { icon: ShieldCheck, label: "Providers enabled", value: providersEnabled },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <s.icon size={15} /><span className="text-xs uppercase tracking-wide">{s.label}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-zinc-200">New users</h3>
          <span className="text-xs text-zinc-600">last 14 days</span>
        </div>

        <div className="mt-5 flex h-40 items-end gap-1.5 border-b border-zinc-800">
          {days.map((d, i) => (
            <div key={i} className="group relative flex flex-1 items-end" style={{ height: "100%" }}>
              <div
                className="w-full rounded-t-sm bg-amber-500/80 transition group-hover:bg-amber-400"
                style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 3 : 0 }}
              />
              {/* hover tooltip */}
              <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 opacity-0 shadow-lg transition group-hover:opacity-100">
                <span className="font-medium tabular-nums">{d.count}</span> · {d.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
          <span>{days[0].label}</span>
          <span>{days[days.length - 1].label}</span>
        </div>
      </div>
    </div>
  );
}
