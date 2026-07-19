"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/billing/plans";
import { formatMoney } from "@/lib/billing/format";

export default function PlanCards({
  projectId,
  currentPlan,
}: {
  projectId: string;
  currentPlan: PlanId;
}) {
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: PlanId) {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch(`/api/internal/billing/checkout?project=${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok || !json.checkoutUrl) throw new Error(json.error ?? "Could not start checkout");
      window.location.href = json.checkoutUrl; // Spurs Pay hosted checkout
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          const isFree = id === "free";
          return (
            <div
              key={id}
              className={`rounded-xl border p-5 ${
                isCurrent ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                {isCurrent && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>
              <div className="mt-4">
                <span className="text-2xl font-semibold">{isFree ? "Free" : formatMoney(plan.price)}</span>
                {!isFree && <span className="text-sm text-zinc-500"> /mo</span>}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || isFree || busy !== null}
                onClick={() => upgrade(id)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                  isCurrent || isFree
                    ? "cursor-default bg-zinc-800 text-zinc-500"
                    : "bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
                }`}
              >
                {busy === id && <Loader2 size={15} className="animate-spin" />}
                {isCurrent ? "Active" : isFree ? "—" : busy === id ? "Redirecting…" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
