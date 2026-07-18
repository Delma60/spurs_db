import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Database, FileJson, HardDrive, Zap, KeyRound, FunctionSquare, type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { SERVICES, STATUS_STYLES } from "@/lib/services";

const ICONS: Record<string, LucideIcon> = {
  Database, FileJson, HardDrive, Zap, KeyRound, FunctionSquare,
};

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { userId, projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-800 text-lg font-semibold text-amber-400">
          {project.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-sm text-zinc-500">{project.slug} · {project.region}</p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">Services</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.icon] ?? Database;
          const st = STATUS_STYLES[s.status];
          return (
            <Link
              key={s.slug}
              href={`/u/${userId}/project/${project.id}/${s.slug}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-800 text-amber-400">
                  <Icon size={18} />
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                  {st.label}
                </span>
              </div>
              <div className="mt-3 font-medium">{s.name}</div>
              <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
