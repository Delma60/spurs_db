import Link from "next/link";
import { H1, Lead, H2, P, Ul } from "@/components/docs/prose";
import { Database, HardDrive, Zap, KeyRound, FunctionSquare } from "lucide-react";

export default function DocsIntro() {
  const services = [
    { icon: Database, name: "Database", desc: "Tables with instant, secure REST APIs.", href: "/docs/database" },
    { icon: HardDrive, name: "Storage", desc: "Buckets for files and media.", href: "/docs/storage" },
    { icon: Zap, name: "Realtime Database", desc: "A live JSON tree, synced across clients.", href: "/docs/realtime" },
    { icon: KeyRound, name: "Authentication", desc: "Sign your own users in.", href: "/docs/auth" },
    { icon: FunctionSquare, name: "Functions", desc: "Run backend logic on demand.", href: "/docs/functions" },
  ];
  return (
    <div>
      <H1>Spurs BaaS</H1>
      <Lead>A complete backend for your app — database, storage, realtime, authentication and functions, behind one API key.</Lead>

      <P>
        Create a project in the console, turn on the services you need, and call them from any client with a project
        API key. No servers to manage and no infrastructure to name — you work with capabilities, not engines.
      </P>

      <H2>Services</H2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <Link key={s.name} href={s.href} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
            <s.icon size={18} className="text-amber-400" />
            <div className="mt-2 font-medium text-zinc-100">{s.name}</div>
            <p className="mt-0.5 text-sm text-zinc-400">{s.desc}</p>
          </Link>
        ))}
      </div>

      <H2>How it works</H2>
      <Ul>
        <li>Every request is scoped to a project and authorized by that project&apos;s API key.</li>
        <li>Data and files are isolated per project — one project can never read another&apos;s.</li>
        <li>The same data is reachable from the console, the REST API, and realtime streams.</li>
      </Ul>

      <P>
        Ready? Head to the <Link href="/docs/quickstart" className="text-amber-400 hover:underline">Quickstart</Link>.
      </P>
    </div>
  );
}
