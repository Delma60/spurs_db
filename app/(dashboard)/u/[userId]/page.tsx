import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, Users, Gauge } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/projects";
import TopNav from "@/components/layout/TopNav";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import { createProjectAction } from "@/lib/actions/project-actions";

export default async function UserHome({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId } = await params;
  const user = await requireUser();
  if (userId !== user.sub) redirect(`/u/${user.sub}`);

  const { error } = await searchParams;
  const projects = await listProjects(user.sub);

  const stats = [
    { icon: FolderKanban, label: "Projects", value: projects.length },
    { icon: Users, label: "Members", value: 1 },
    { icon: Gauge, label: "Plan", value: "Free" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TopNav user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {(user.name ?? "there").split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Your backend projects</p>
          </div>
          <CreateProjectDialog action={createProjectAction} />
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <s.icon size={15} />
                <span className="text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All projects
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-800 py-16 text-center">
              <p className="text-zinc-400">No projects yet.</p>
              <p className="mt-1 text-sm text-zinc-600">Create your first project to get started.</p>
            </div>
          ) : (
            projects.map((p) => (
              <Link
                key={p.id}
                href={`/u/${user.sub}/project/${p.id}/overview`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-800 text-sm font-semibold text-amber-400">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-xs text-zinc-500">{p.slug}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5">{p.region}</span>
                  <span className="text-amber-400/0 transition group-hover:text-amber-400">Open →</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
