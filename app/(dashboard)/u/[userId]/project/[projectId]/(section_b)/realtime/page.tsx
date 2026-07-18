import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import RealtimeDatabase from "@/components/realtime/RealtimeDatabase";

export default async function RealtimePage({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user.sub, projectId);
  if (!project) notFound();

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const rootUrl = `${appUrl}/api/v1/rtdb`;

  return <RealtimeDatabase project={project.id} rootUrl={rootUrl} />;
}
