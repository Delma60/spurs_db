import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listFunctions, createFunction } from "@/lib/functions";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json({ functions: await listFunctions(auth.project.id) });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const fn = await createFunction(auth.project.id, String(body.name ?? ""));
    return NextResponse.json({ function: fn });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
