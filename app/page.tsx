import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Present capabilities, never the engines behind them (no Postgres/MinIO/etc).
const SERVICES = [
  { icon: "🗄️", name: "Database", desc: "Tables with instant, secure APIs", tag: "Relational", status: "next" },
  { icon: "📄", name: "Collections", desc: "Flexible NoSQL documents", tag: "Document store", status: "next" },
  { icon: "🪣", name: "Storage", desc: "Buckets for files and media", tag: "Object storage", status: "next" },
  { icon: "⚡", name: "Realtime", desc: "Subscribe to live data changes", tag: "Live sync", status: "later" },
  { icon: "🔑", name: "Auth", desc: "Sign users in with Spurs", tag: "Managed auth", status: "live" },
  { icon: "⚙️", name: "Functions", desc: "Run backend logic on demand", tag: "Serverless", status: "later" },
];

const STATUS: Record<string, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  next: { label: "Building", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  later: { label: "Planned", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};

export default async function Console() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  const name = session?.name ?? "there";
  const initial = (session?.name ?? session?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-black">
              B
            </span>
            <div className="font-semibold">Spurs BaaS</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{session?.name}</div>
              <div className="text-xs text-zinc-500">{session?.email}</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1a73e8] text-sm font-semibold">
              {initial}
            </span>
            <a href="/auth/logout" className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800">
              Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Signed in with Spurs
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome, {name.split(" ")[0]}</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Your backend for building apps fast — database, NoSQL, file storage and realtime,
          all behind one Spurs login.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const st = STATUS[s.status];
            return (
              <div key={s.name} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <div className="mt-3 font-medium">{s.name}</div>
                <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
                <div className="mt-3 text-[11px] uppercase tracking-wide text-zinc-600">{s.tag}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
