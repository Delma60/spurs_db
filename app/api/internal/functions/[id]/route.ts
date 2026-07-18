import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { getFunction, updateFunction, deleteFunction } from "@/lib/functions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  const fn = await getFunction(auth.project.id, id);
  if (!fn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ function: fn });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  const body = await req.json();
  await updateFunction(auth.project.id, id, String(body.code ?? ""));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  await deleteFunction(auth.project.id, id);
  return NextResponse.json({ ok: true });
}
