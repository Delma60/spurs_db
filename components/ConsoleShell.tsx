import Link from "next/link";
import type { Session } from "@/lib/session";

export default function ConsoleShell({
  user,
  children,
}: {
  user: Session;
  children: React.ReactNode;
}) {
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">
              B
            </span>
            Spurs BaaS
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-400 sm:block">{user.email}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-800 text-sm font-medium">
              {initial}
            </span>
            <a href="/auth/logout" className="text-sm text-zinc-400 transition hover:text-zinc-100">
              Sign out
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
