import { db, realtimeData, sql } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schemaName } from "@/lib/db/tables";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** NOTIFY channel for a project's Realtime Database. */
export function rtdbChannel(projectId: string): string {
  return `rtdb_${schemaName(projectId)}`;
}

function splitPath(path: string): string[] {
  return path.split("/").map((p) => p.trim()).filter(Boolean);
}

export async function getData(projectId: string): Promise<Json> {
  const [row] = await db.select().from(realtimeData).where(eq(realtimeData.projectId, projectId)).limit(1);
  return (row?.data as Json) ?? null;
}

async function saveData(projectId: string, data: Json): Promise<void> {
  await db
    .insert(realtimeData)
    .values({ projectId, data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: realtimeData.projectId, set: { data, updatedAt: new Date() } });
  await sql`select pg_notify(${rtdbChannel(projectId)}, '1')`;
}

export async function getPath(projectId: string, path: string): Promise<Json> {
  let node: Json = await getData(projectId);
  for (const k of splitPath(path)) {
    if (node == null || typeof node !== "object" || Array.isArray(node)) return null;
    node = (node as Record<string, Json>)[k] ?? null;
  }
  return node;
}

export async function setPath(projectId: string, path: string, value: Json): Promise<void> {
  const keys = splitPath(path);
  if (keys.length === 0) {
    await saveData(projectId, value);
    return;
  }
  let data = await getData(projectId);
  if (data == null || typeof data !== "object" || Array.isArray(data)) data = {};
  let node = data as Record<string, Json>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (node[k] == null || typeof node[k] !== "object" || Array.isArray(node[k])) node[k] = {};
    node = node[k] as Record<string, Json>;
  }
  node[keys[keys.length - 1]] = value;
  await saveData(projectId, data);
}

export async function removePath(projectId: string, path: string): Promise<void> {
  const keys = splitPath(path);
  if (keys.length === 0) {
    await saveData(projectId, {});
    return;
  }
  const data = await getData(projectId);
  if (data == null || typeof data !== "object") return;
  let node = data as Record<string, Json>;
  for (let i = 0; i < keys.length - 1; i++) {
    const next = node[keys[i]];
    if (next == null || typeof next !== "object" || Array.isArray(next)) return;
    node = next as Record<string, Json>;
  }
  delete node[keys[keys.length - 1]];
  await saveData(projectId, data);
}
