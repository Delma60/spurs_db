import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import StorageBrowser from "@/components/storage/StorageBrowser";

export default async function StoragePage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  return <StorageBrowser project={project.id} />;
}
