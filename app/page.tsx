import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

// Root just forwards signed-in users to their dashboard (proxy handles guests).
export default async function Root() {
  const user = await requireUser();
  redirect(`/u/${user.sub}`);
}
