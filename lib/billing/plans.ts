// Spurs BaaS plans. Prices in minor units (kobo). Capability-described only —
// nothing here (or in the UI) names an underlying engine or payment processor.
export type PlanId = "free" | "pro" | "scale";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // minor units per month
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "For prototypes and side projects",
    features: ["1 project", "Shared capacity", "Community support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 500000, // ₦5,000
    tagline: "For production apps",
    features: ["Unlimited projects", "Daily backups", "Email support", "Higher rate limits"],
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: 2000000, // ₦20,000
    tagline: "For growing teams",
    features: ["Everything in Pro", "Priority support", "Dedicated capacity", "Usage analytics"],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "scale"];

export function isPlan(v: string): v is PlanId {
  return v === "free" || v === "pro" || v === "scale";
}
