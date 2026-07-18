import { db, endUsers } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { getAuthSettings } from "@/lib/authsettings";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-insecure-secret-change-me-32ch");

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}
function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** A project-scoped end-user session token (distinct from the console session). */
async function issueToken(user: { id: string; projectId: string; email: string }): Promise<string> {
  return new SignJWT({ project: user.projectId, email: user.email, typ: "enduser" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export interface EndUserToken {
  sub: string;
  project: string;
  email: string;
}

export async function verifyEndUserToken(token: string): Promise<EndUserToken | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.typ !== "enduser") return null;
    return { sub: payload.sub as string, project: payload.project as string, email: payload.email as string };
  } catch {
    return null;
  }
}

const publicUser = (u: { id: string; email: string }) => ({ id: u.id, email: u.email });

export async function signUp(projectId: string, email: string, password: string) {
  const settings = await getAuthSettings(projectId);
  if (!settings.providers.password) throw new Error("Email/Password sign-in is not enabled for this project.");
  if (!settings.allowSignups) throw new Error("New sign-ups are disabled for this project.");

  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  try {
    const [user] = await db
      .insert(endUsers)
      .values({ projectId, email: e, passwordHash: hashPassword(password) })
      .returning();
    return { token: await issueToken({ id: user.id, projectId, email: e }), user: publicUser(user) };
  } catch {
    throw new Error("That email is already registered.");
  }
}

export async function signIn(projectId: string, email: string, password: string) {
  if (!(await getAuthSettings(projectId)).providers.password) {
    throw new Error("Email/Password sign-in is not enabled for this project.");
  }
  const e = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(endUsers)
    .where(and(eq(endUsers.projectId, projectId), eq(endUsers.email, e)))
    .limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }
  await db.update(endUsers).set({ lastSignInAt: new Date() }).where(eq(endUsers.id, user.id));
  return { token: await issueToken({ id: user.id, projectId, email: e }), user: publicUser(user) };
}

/** Create a user from the console (no token issued). */
export async function adminCreateUser(projectId: string, email: string, password: string) {
  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  try {
    const [user] = await db
      .insert(endUsers)
      .values({ projectId, email: e, passwordHash: hashPassword(password) })
      .returning();
    return publicUser(user);
  } catch {
    throw new Error("That email is already registered.");
  }
}

export async function listEndUsers(projectId: string) {
  return db
    .select({
      id: endUsers.id,
      email: endUsers.email,
      createdAt: endUsers.createdAt,
      lastSignInAt: endUsers.lastSignInAt,
    })
    .from(endUsers)
    .where(eq(endUsers.projectId, projectId))
    .orderBy(desc(endUsers.createdAt));
}

export async function deleteEndUser(projectId: string, id: string): Promise<void> {
  await db.delete(endUsers).where(and(eq(endUsers.id, id), eq(endUsers.projectId, projectId)));
}
