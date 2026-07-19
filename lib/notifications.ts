import { db } from "@/lib/db";
import { notifications, type Notification } from "@/lib/db/schema";
import { and, eq, desc, count } from "drizzle-orm";

export async function listNotifications(userId: string, limit = 20): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function unreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return Number(row?.n ?? 0);
}

export async function markRead(userId: string, id: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.id, id)));
}

export async function markAllRead(userId: string) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}

/** Emit a notification. Best-effort — never let it break the triggering action. */
export async function notify(userId: string, title: string, body?: string, href?: string) {
  try {
    await db.insert(notifications).values({ userId, title, body: body ?? null, href: href ?? null });
  } catch {
    // swallow
  }
}
