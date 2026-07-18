"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createProject } from "@/lib/projects";

const NewProject = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(64),
});

export async function createProjectAction(formData: FormData) {
  const session = await requireUser();

  const parsed = NewProject.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    redirect(`/?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const project = await createProject(session.sub, parsed.data.name);
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}
