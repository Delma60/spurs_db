"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Database, FileJson, HardDrive, Zap, KeyRound,
  FunctionSquare, CreditCard, Settings, type LucideIcon,
} from "lucide-react";
import { SERVICES } from "@/lib/services";

const ICONS: Record<string, LucideIcon> = {
  LayoutGrid, Database, FileJson, HardDrive, Zap, KeyRound, FunctionSquare, CreditCard, Settings,
};

export default function Sidebar({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const pathname = usePathname();
  const base = `/u/${userId}/project/${projectId}`;

  const items = [
    { slug: "overview", name: "Overview", icon: "LayoutGrid" },
    ...SERVICES.map((s) => ({ slug: s.slug, name: s.name, icon: s.icon })),
    { slug: "billing", name: "Billing", icon: "CreditCard" },
    { slug: "settings", name: "Settings", icon: "Settings" },
  ];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-zinc-800 md:block">
      <nav className="sticky top-14 flex flex-col gap-0.5 p-3">
        {items.map((item) => {
          const href = `${base}/${item.slug}`;
          const active = pathname.startsWith(href);
          const Icon = ICONS[item.icon] ?? LayoutGrid;
          return (
            <Link
              key={item.slug}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-zinc-800 font-medium text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Icon size={17} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
