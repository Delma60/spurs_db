import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { isOwner } from "@/lib/members";
import SettingsTabs from "@/components/settings/SettingsTabs";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  const canManage = await isOwner(project.id, user.sub);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage {project.name}</p>
      <div className="mt-6">
        <SettingsTabs
          project={{ id: project.id, name: project.name, slug: project.slug, region: project.region }}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
