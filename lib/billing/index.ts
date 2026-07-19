import { db } from "@/lib/db";
import { subscriptions, invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PlanId } from "./plans";

/** Current plan for a project (defaults to free if no row yet). */
export async function getSubscription(projectId: string) {
  const [s] = await db.select().from(subscriptions).where(eq(subscriptions.projectId, projectId)).limit(1);
  return s ?? { projectId, plan: "free" as PlanId, status: "active", renewsAt: null, updatedAt: new Date() };
}

export async function listInvoices(projectId: string) {
  return db.select().from(invoices).where(eq(invoices.projectId, projectId)).orderBy(desc(invoices.createdAt)).limit(50);
}

export async function getInvoiceByReference(payReference: string) {
  const [i] = await db.select().from(invoices).where(eq(invoices.payReference, payReference)).limit(1);
  return i ?? null;
}

/** Record a pending invoice for an attempted plan change. */
export async function createInvoice(input: {
  projectId: string;
  plan: PlanId;
  amount: number;
  currency: string;
  payReference: string;
}) {
  const [i] = await db
    .insert(invoices)
    .values({
      projectId: input.projectId,
      plan: input.plan,
      amount: String(input.amount),
      currency: input.currency,
      payReference: input.payReference,
    })
    .returning();
  return i;
}

/** Mark an invoice paid and move the project onto its plan. Idempotent. */
export async function activateInvoice(payReference: string) {
  const invoice = await getInvoiceByReference(payReference);
  if (!invoice || invoice.status === "paid") return invoice;

  await db.update(invoices).set({ status: "paid", paidAt: new Date() }).where(eq(invoices.payReference, payReference));

  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);
  await db
    .insert(subscriptions)
    .values({ projectId: invoice.projectId, plan: invoice.plan, status: "active", renewsAt })
    .onConflictDoUpdate({
      target: subscriptions.projectId,
      set: { plan: invoice.plan, status: "active", renewsAt, updatedAt: new Date() },
    });

  return { ...invoice, status: "paid" as const };
}

/** Mark an invoice failed (idempotent). */
export async function failInvoice(payReference: string) {
  await db.update(invoices).set({ status: "failed" }).where(eq(invoices.payReference, payReference));
}
