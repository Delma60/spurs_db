"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createProject, getProject } from "@/lib/projects";
import { notify } from "@/lib/notifications";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";

const REGIONS = ["us-east", "us-west", "eu-west", "af-south"] as const;

const NewProject = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(64),
  region: z.enum(REGIONS).default("us-east"),
});

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();

  const parsed = NewProject.safeParse({
    name: formData.get("name"),
    region: formData.get("region") ?? "us-east",
  });
  if (!parsed.success) {
    redirect(`/u/${user.sub}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const project = await createProject(user.sub, parsed.data.name, parsed.data.region);
  await notify(user.sub, "Project created", `${project.name} is ready to build on.`, `/u/${user.sub}/project/${project.id}/overview`);
  revalidatePath(`/u/${user.sub}`);
  redirect(`/u/${user.sub}/project/${project.id}/overview`);
}

export async function renameProjectAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = z.string().trim().min(2).max(64).safeParse(formData.get("name"));

  const project = await getProject(user.sub, id);
  if (!project) redirect(`/u/${user.sub}`);
  if (!parsed.success) redirect(`/u/${user.sub}/project/${id}/settings?error=Invalid+name`);

  await db.update(projects).set({ name: parsed.data }).where(eq(projects.id, id));
  revalidatePath(`/u/${user.sub}/project/${id}`, "layout");
  redirect(`/u/${user.sub}/project/${id}/settings`);
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const project = await getProject(user.sub, id);
  if (!project) redirect(`/u/${user.sub}`);

  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath(`/u/${user.sub}`);
  redirect(`/u/${user.sub}`);
}
