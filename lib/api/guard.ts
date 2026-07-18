import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import type { Project } from "@/lib/db";
import type { Session } from "@/lib/auth/session";

type Authorized = { session: Session; project: Project };
type Denied = { error: NextResponse };

/** Resolve + authorize a project from a request. Returns the project or an error Response. */
export async function authorizeProject(projectId: string | null): Promise<Authorized | Denied> {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!projectId) return { error: NextResponse.json({ error: "Missing project" }, { status: 400 }) };

  const project = await getProject(session.sub, projectId);
  if (!project) return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };

  return { session, project };
}
