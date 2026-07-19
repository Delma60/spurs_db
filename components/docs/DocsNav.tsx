"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DocsNav({ links }: { links: { href: string; title: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`block rounded-md px-2.5 py-1.5 text-sm transition ${
                active ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {l.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
