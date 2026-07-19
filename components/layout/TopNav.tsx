import Link from "next/link";
import type { Session } from "@/lib/auth/session";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

export default function TopNav({
  user,
  left,
}: {
  user: Session;
  left?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-100">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">
              B
            </span>
            <span className="hidden sm:inline">Spurs BaaS</span>
          </Link>
          {left}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/docs"
            className="mr-1 hidden rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 sm:block"
          >
            Docs
          </Link>
          <NotificationBell />
          <UserMenu name={user.name} email={user.email} />
        </div>
      </div>
    </header>
  );
}
