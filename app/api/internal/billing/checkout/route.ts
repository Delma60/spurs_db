import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeProject } from "@/lib/api/guard";
import { PLANS, isPlan } from "@/lib/billing/plans";
import { createInvoice } from "@/lib/billing";
import { createPayPayment } from "@/lib/billing/pay-client";

// POST /api/internal/billing/checkout?project=<id>  { plan }
// Creates a pending invoice and a Spurs Pay payment, returns the checkout URL.
export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  const planId = String(body.plan ?? "");
  if (!isPlan(planId) || planId === "free") {
    return NextResponse.json({ error: "Choose a paid plan" }, { status: 400 });
  }
  const plan = PLANS[planId];

  // Own the reference so the return URL can carry it back for verification.
  const reference = "inv_" + randomBytes(12).toString("hex");
  const returnUrl = `${process.env.APP_URL}/u/${auth.session.sub}/project/${auth.project.id}/billing/return?ref=${reference}`;

  try {
    const payment = await createPayPayment({
      merchant: auth.session.sub,
      businessName: auth.session.name ?? auth.session.email ?? "Spurs user",
      amount: plan.price,
      currency: "NGN",
      description: `Spurs BaaS ${plan.name} — ${auth.project.name}`,
      reference,
      callbackUrl: returnUrl,
    });

    await createInvoice({
      projectId: auth.project.id,
      plan: planId,
      amount: plan.price,
      currency: "NGN",
      payReference: payment.reference,
    });

    return NextResponse.json({ checkoutUrl: payment.checkoutUrl, reference: payment.reference });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
