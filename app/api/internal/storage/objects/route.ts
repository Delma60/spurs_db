import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { getBucket } from "@/lib/storage";
import { listObjects, removeObject } from "@/lib/s3";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const auth = await authorizeProject(params.get("project"));
  if ("error" in auth) return auth.error;

  const bucket = await getBucket(auth.project.id, params.get("bucket") ?? "");
  if (!bucket) return NextResponse.json({ error: "Bucket not found" }, { status: 404 });

  const objects = await listObjects(auth.project.id, bucket.name);
  return NextResponse.json({ objects, bucket: { name: bucket.name, public: bucket.public } });
}

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const auth = await authorizeProject(params.get("project"));
  if ("error" in auth) return auth.error;

  const bucket = await getBucket(auth.project.id, params.get("bucket") ?? "");
  if (!bucket) return NextResponse.json({ error: "Bucket not found" }, { status: 404 });

  const name = params.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  await removeObject(auth.project.id, bucket.name, name);
  return NextResponse.json({ ok: true });
}
