import { db, apiKeys } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function listKeys(projectId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revoked: apiKeys.revoked,
    })
    .from(apiKeys)
    .where(eq(apiKeys.projectId, projectId))
    .orderBy(desc(apiKeys.createdAt));
}

/** Create a key — the full secret is returned ONCE and only its hash is stored. */
export async function createKey(projectId: string, name: string) {
  const raw = "sk_" + randomBytes(24).toString("base64url");
  const prefix = raw.slice(0, 11);
  const [row] = await db
    .insert(apiKeys)
    .values({ projectId, name: name.trim() || "Default key", prefix, keyHash: hashKey(raw) })
    .returning();
  return { key: raw, id: row.id, prefix };
}

export async function revokeKey(projectId: string, id: string): Promise<void> {
  await db
    .update(apiKeys)
    .set({ revoked: true })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.projectId, projectId)));
}

/** Resolve a raw API key to its project (or null). Updates last-used. */
export async function resolveProjectByKey(raw: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hashKey(raw)), eq(apiKeys.revoked, false)))
    .limit(1);
  if (!row) return null;
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return row.projectId;
}
