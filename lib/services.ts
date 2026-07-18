// Product capabilities a project exposes. Engine-agnostic on purpose —
// the UI never names Postgres/MinIO/etc.
export type ServiceStatus = "live" | "next" | "later";

export interface Service {
  slug: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name, resolved in components
  status: ServiceStatus;
}

export const SERVICES: Service[] = [
  { slug: "database", name: "Database", desc: "Tables with instant, secure APIs", icon: "Database", status: "live" },
  { slug: "nosql", name: "Collections", desc: "Flexible NoSQL documents", icon: "FileJson", status: "next" },
  { slug: "storage", name: "Storage", desc: "Buckets for files and media", icon: "HardDrive", status: "live" },
  { slug: "realtime", name: "Realtime Database", desc: "Live JSON tree, synced across clients", icon: "Zap", status: "live" },
  { slug: "auth", name: "Authentication", desc: "Sign users into your app", icon: "KeyRound", status: "live" },
  { slug: "functions", name: "Functions", desc: "Run backend logic on demand", icon: "FunctionSquare", status: "live" },
];

export const STATUS_STYLES: Record<ServiceStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  next: { label: "Building", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  later: { label: "Planned", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};
