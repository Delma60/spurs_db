"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "verifying" | "successful" | "failed" | "pending";

export default function ReturnVerifier({ reference, billingHref }: { reference: string; billingHref: string }) {
  const [status, setStatus] = useState<Status>("verifying");
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        const res = await fetch("/api/internal/billing/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const json = await res.json();
        if (cancelled) return;
        setStatus(json.status ?? "failed");
        if (json.plan) setPlan(json.plan);
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      {status === "verifying" && (
        <>
          <Loader2 className="mx-auto animate-spin text-zinc-400" size={40} />
          <p className="mt-4 text-zinc-300">Confirming your payment…</p>
        </>
      )}
      {status === "successful" && (
        <>
          <CheckCircle2 className="mx-auto text-emerald-400" size={44} />
          <h1 className="mt-4 text-lg font-semibold">Payment successful</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your project is now on the <span className="capitalize text-zinc-200">{plan ?? "new"}</span> plan.
          </p>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle className="mx-auto text-red-400" size={44} />
          <h1 className="mt-4 text-lg font-semibold">Payment not completed</h1>
          <p className="mt-1 text-sm text-zinc-400">No changes were made to your plan.</p>
        </>
      )}
      {status === "pending" && (
        <>
          <Loader2 className="mx-auto animate-spin text-amber-400" size={40} />
          <h1 className="mt-4 text-lg font-semibold">Payment pending</h1>
          <p className="mt-1 text-sm text-zinc-400">We&apos;ll update your plan once it clears.</p>
        </>
      )}

      <Link
        href={billingHref}
        className="mt-6 inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
      >
        Back to billing
      </Link>
    </div>
  );
}
