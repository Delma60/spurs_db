import { db, projects } from "@/lib/db";
import { projectMembers, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export interface Member {
  userId: string;
  name: string | null;
  email: string | null;
  role: string;
  isOwner: boolean;
  createdAt: Date;
}

/** Members of a project, owner first. */
export async function listMembers(projectId: string): Promise<Member[]> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const rows = await db
    .select({
      userId: projectMembers.userId,
      role: projectMembers.role,
      createdAt: projectMembers.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(projectMembers)
    .leftJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId));

  return rows
    .map((r) => ({ ...r, isOwner: r.userId === project?.ownerId }))
    .sort((a, b) => Number(b.isOwner) - Number(a.isOwner));
}

/** Add a member by email. The invitee must already have a Spurs account that has
 * signed into baas at least once (so we can resolve their id). */
export async function addMemberByEmail(projectId: string, email: string, role: "admin" | "member") {
  const [u] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!u) throw new Error("No Spurs user with that email has signed in yet.");

  await db
    .insert(projectMembers)
    .values({ projectId, userId: u.id, role })
    .onConflictDoUpdate({ target: [projectMembers.projectId, projectMembers.userId], set: { role } });

  return { userId: u.id };
}

export async function removeMember(projectId: string, userId: string) {
  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
}

/** True if the user owns the project (only the owner may manage members). */
export async function isOwner(projectId: string, userId: string): Promise<boolean> {
  const [p] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return p?.ownerId === userId;
}
