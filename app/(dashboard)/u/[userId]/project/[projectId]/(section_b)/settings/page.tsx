import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { deleteProjectAction } from "@/lib/actions/project-actions";
import ConfirmForm from "@/components/shared/ConfirmForm";
import ApiKeysClient from "@/components/settings/ApiKeysClient";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage {project.name}</p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          <span className="text-zinc-500">Name</span><span>{project.name}</span>
          <span className="text-zinc-500">Slug</span><span className="text-zinc-400">{project.slug}</span>
          <span className="text-zinc-500">Region</span><span className="text-zinc-400">{project.region}</span>
        </div>
      </div>

      <div className="mt-6">
        <ApiKeysClient project={project.id} />
        <p className="mt-3 text-xs text-zinc-600">
          Public API base: <code className="text-zinc-400">/api/v1/db/&lt;table&gt;</code> · send{" "}
          <code className="text-zinc-400">Authorization: Bearer &lt;key&gt;</code>
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h2 className="font-medium text-red-300">Delete project</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Permanently remove this project and everything in it. This cannot be undone.
        </p>
        <ConfirmForm
          action={deleteProjectAction}
          hidden={{ id: project.id }}
          title="Delete project"
          message={`Delete "${project.name}" and everything in it? This cannot be undone.`}
          confirmLabel="Delete project"
          className="mt-4"
        >
          <button className="h-9 rounded-lg border border-red-500/40 bg-red-500/10 px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/20">
            Delete this project
          </button>
        </ConfirmForm>
      </div>
    </div>
  );
}
