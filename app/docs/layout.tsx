import Link from "next/link";
import { DOCS_NAV, docHref } from "@/lib/docs-nav";
import DocsNav from "@/components/docs/DocsNav";

export const metadata = {
  title: "Spurs BaaS — Docs",
  description: "Build backends fast with Spurs BaaS: Database, Storage, Realtime, Auth and Functions.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/docs" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">B</span>
            Spurs BaaS <span className="text-zinc-600">docs</span>
          </Link>
          <Link href="/" className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700">
            Open console
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 sm:px-6">
        <aside className="hidden w-56 shrink-0 py-8 md:block">
          <nav className="sticky top-20 space-y-6">
            {DOCS_NAV.map((section) => (
              <div key={section.title}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{section.title}</div>
                <DocsNav links={section.links.map((l) => ({ href: docHref(l.slug), title: l.title }))} />
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-8">
          <article className="max-w-2xl">{children}</article>
        </main>
      </div>
    </div>
  );
}
