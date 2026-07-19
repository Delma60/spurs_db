import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { getSubscription, listInvoices } from "@/lib/billing";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { formatMoney } from "@/lib/billing/format";
import PlanCards from "./PlanCards";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  const [sub, invoices] = await Promise.all([getSubscription(projectId), listInvoices(projectId)]);
  const plan = PLANS[sub.plan as PlanId] ?? PLANS.free;

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage your plan and payments for this project.</p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Current plan</p>
            <p className="mt-0.5 text-lg font-semibold">{plan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{plan.price === 0 ? "Free" : `${formatMoney(plan.price)}/mo`}</p>
            {sub.renewsAt && (
              <p className="text-xs text-zinc-500">Renews {new Date(sub.renewsAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">Plans</h2>
      <div className="mt-4">
        <PlanCards projectId={project.id} currentPlan={(sub.plan as PlanId) ?? "free"} />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">Invoices</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
        {invoices.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/70 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2.5 text-zinc-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 capitalize">{inv.plan}</td>
                  <td className="px-4 py-2.5">{formatMoney(Number(inv.amount), inv.currency)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        inv.status === "paid"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : inv.status === "failed"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-zinc-500/15 text-zinc-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
