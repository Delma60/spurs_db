import { NextRequest, NextResponse } from "next/server";
import { resolveProjectByKey } from "@/lib/apikeys";
import { listRows, insertRow, deleteRow } from "@/lib/db/tables";

// Public data API. External apps call it with their project API key:
//   Authorization: Bearer sk_...   (or  x-api-key: sk_...)
function apiKey(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("x-api-key");
}

async function resolve(req: NextRequest): Promise<string | null> {
  const key = apiKey(req);
  return key ? resolveProjectByKey(key) : null;
}

const unauthorized = () =>
  NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

export async function GET(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const projectId = await resolve(req);
  if (!projectId) return unauthorized();
  try {
    return NextResponse.json({ data: await listRows(projectId, table) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const projectId = await resolve(req);
  if (!projectId) return unauthorized();
  try {
    const body = await req.json();
    return NextResponse.json({ data: await insertRow(projectId, table, body) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const projectId = await resolve(req);
  if (!projectId) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await deleteRow(projectId, table, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
