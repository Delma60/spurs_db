import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listBuckets, createBucket } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  const buckets = await listBuckets(auth.project.id);
  return NextResponse.json({ buckets });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const bucket = await createBucket(auth.project.id, String(body.name ?? ""), !!body.public);
    return NextResponse.json({ bucket });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
