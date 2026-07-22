// baas Billing is a trusted Spurs service, so it talks to Spurs Pay's private
// API via @spurs-cloud/pay (SpursPayInternal). This module keeps the original
// function names so the billing routes don't change.
import { SpursPayInternal } from "@spurs-cloud/pay";

// PAY_INTERNAL_URL overrides the SDK's baked-in production URL for local dev.
const pay = () => new SpursPayInternal({ baseUrl: process.env.PAY_INTERNAL_URL });

interface CreatePaymentInput {
  merchant: string; // Spurs user id (the project owner)
  businessName?: string;
  amount: number; // minor units
  currency?: string;
  description?: string;
  reference?: string;
  callbackUrl?: string;
}

export interface PayPayment {
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  checkoutUrl: string;
  paidAt: string | null;
}

export async function createPayPayment(input: CreatePaymentInput): Promise<PayPayment> {
  return (await pay().createPayment(input)) as unknown as PayPayment;
}

export async function getPayPayment(reference: string): Promise<PayPayment | null> {
  return (await pay().getPayment(reference)) as unknown as PayPayment | null;
}
