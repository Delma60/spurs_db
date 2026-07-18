import { redirect } from "next/navigation";

// The bare project route forwards to its Overview.
export default async function ProjectIndex({
  params,
}: {
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { userId, projectId } = await params;
  redirect(`/u/${userId}/project/${projectId}/overview`);
}
