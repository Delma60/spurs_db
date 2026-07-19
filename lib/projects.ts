import { db, projects, projectMembers, type Project } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "project";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function listProjects(userId: string): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getProject(userId: string, id: string): Promise<Project | null> {
  const [p] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!p || p.ownerId !== userId) return null;
  return p;
}

/** No ownership check — for trusted internal/service access only. */
export async function getProjectById(id: string): Promise<Project | null> {
  const [p] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return p ?? null;
}

export async function createProject(
  userId: string,
  name: string,
  region = "us-east",
): Promise<Project> {
  const [project] = await db
    .insert(projects)
    .values({ ownerId: userId, name: name.trim(), slug: slugify(name), region })
    .returning();

  await db.insert(projectMembers).values({
    projectId: project.id,
    userId,
    role: "owner",
  });

  return project;
}
