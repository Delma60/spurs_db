import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProject, listProjects } from "@/lib/projects";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import ProjectSwitcher from "@/components/layout/ProjectSwitcher";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { userId, projectId } = await params;
  const user = await requireUser();
  if (userId !== user.sub) redirect(`/u/${user.sub}`);

  const [project, projects] = await Promise.all([
    getProject(user.sub, projectId),
    listProjects(user.sub),
  ]);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TopNav
        user={user}
        left={
          <ProjectSwitcher
            userId={user.sub}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            currentId={project.id}
          />
        }
      />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar userId={user.sub} projectId={project.id} />
        <div className="min-w-0 flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
