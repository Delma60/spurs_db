import { NextRequest, NextResponse } from "next/server";
import { projectFromKey } from "@/lib/api/public";
import { getPath, setPath, removePath } from "@/lib/realtimedb";

// Firebase-style Realtime Database REST API.
//   GET/PUT/DELETE  /api/v1/rtdb/<path...>   with an API key.
async function ctx(req: NextRequest, params: Promise<{ path?: string[] }>) {
  const projectId = await projectFromKey(req);
  const { path } = await params;
  return { projectId, path: (path ?? []).join("/") };
}

const unauthorized = () => NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { projectId, path } = await ctx(req, params);
  if (!projectId) return unauthorized();
  return NextResponse.json(await getPath(projectId, path));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { projectId, path } = await ctx(req, params);
  if (!projectId) return unauthorized();
  const value = await req.json().catch(() => null);
  await setPath(projectId, path, value);
  return NextResponse.json(value);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { projectId, path } = await ctx(req, params);
  if (!projectId) return unauthorized();
  await removePath(projectId, path);
  return NextResponse.json(null);
}
