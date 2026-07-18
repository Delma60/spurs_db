import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { getData, setPath, removePath } from "@/lib/realtimedb";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json({ data: await getData(auth.project.id) });
}

export async function PUT(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  try {
    const { path, value } = await req.json();
    await setPath(auth.project.id, String(path ?? ""), value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  await removePath(auth.project.id, req.nextUrl.searchParams.get("path") ?? "");
  return NextResponse.json({ ok: true });
}
