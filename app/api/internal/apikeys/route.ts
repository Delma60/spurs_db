import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listKeys, createKey } from "@/lib/apikeys";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json({ keys: await listKeys(auth.project.id) });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => ({}));
  const created = await createKey(auth.project.id, String(body.name ?? ""));
  return NextResponse.json(created);
}
