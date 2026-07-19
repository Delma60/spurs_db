import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listNotifications, unreadCount, markRead, markAllRead } from "@/lib/notifications";

// GET /api/internal/notifications  → { items, unread }
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [items, unread] = await Promise.all([listNotifications(session.sub), unreadCount(session.sub)]);
  return NextResponse.json({ items, unread });
}

// POST /api/internal/notifications  { id? }  → mark one (id) or all read
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.id) await markRead(session.sub, String(body.id));
  else await markAllRead(session.sub);
  return NextResponse.json({ ok: true });
}
