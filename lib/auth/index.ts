import { redirect } from "next/navigation";
import { getSpursUser, spurs } from "@spurs-cloud/accounts/next";
import type { SpursUser } from "@spurs-cloud/accounts";
import { db, users } from "@/lib/db";

/**
 * Auth is the shared Spurs session — one cookie issued by accounts covers every
 * Spurs app. All the OIDC/PKCE plumbing lives in `@spurs-cloud/accounts`.
 */
export type Session = SpursUser;

/** Current Spurs session in a server component / action, or null. */
export async function getSession(): Promise<Session | null> {
  return getSpursUser();
}

/**
 * Like getSession but bounces to Spurs Accounts when signed out. Projects are
 * foreign-keyed to the control-plane `users` table, so mirror the Spurs user in
 * — this used to happen in the OAuth callback, which the shared session removes.
 */
export async function requireUser(): Promise<Session> {
  const user = await getSession();
  // Home ("/") routes on to /u/<sub>, so returning there is enough.
  if (!user) redirect(spurs().loginUrl(process.env.APP_URL ?? "http://127.0.0.1:3000"));

  await db
    .insert(users)
    .values({ id: user.sub, name: user.name ?? null, email: user.email ?? null })
    .onConflictDoUpdate({ target: users.id, set: { name: user.name ?? null, email: user.email ?? null } });

  return user;
}
