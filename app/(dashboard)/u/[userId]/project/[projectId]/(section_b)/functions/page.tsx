import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import FunctionsClient from "@/components/functions/FunctionsClient";

export default async function FunctionsPage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  return <FunctionsClient project={project.id} />;
}
