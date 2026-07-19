import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInvoiceByReference, activateInvoice, failInvoice } from "@/lib/billing";
import { getPayPayment } from "@/lib/billing/pay-client";
import { notify } from "@/lib/notifications";

// POST /api/internal/billing/verify  { reference }
// Confirms a payment with Spurs Pay and applies the plan. Safe to call twice.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reference = String(body.reference ?? "");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  // Only the owner of the invoice may verify it.
  const invoice = await getInvoiceByReference(reference);
  if (!invoice) return NextResponse.json({ error: "Unknown reference" }, { status: 404 });

  const payment = await getPayPayment(reference);
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (payment.status === "successful") {
    const updated = await activateInvoice(reference);
    if (updated?.plan) {
      await notify(session.sub, "Payment successful", `Your project is now on the ${updated.plan} plan.`);
    }
    return NextResponse.json({ status: "successful", plan: updated?.plan });
  }
  if (payment.status === "failed") {
    await failInvoice(reference);
    return NextResponse.json({ status: "failed" });
  }
  return NextResponse.json({ status: "pending" });
}
