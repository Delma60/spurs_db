import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { getBucket } from "@/lib/storage";
import { putObject } from "@/lib/s3";

// Files stream through our server (browser -> here -> storage) so no bucket
// CORS config is needed. Fine for typical file sizes.
export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const auth = await authorizeProject(params.get("project"));
  if ("error" in auth) return auth.error;

  const bucket = await getBucket(auth.project.id, params.get("bucket") ?? "");
  if (!bucket) return NextResponse.json({ error: "Bucket not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await putObject(auth.project.id, bucket.name, file.name, bytes, file.type || undefined);
  return NextResponse.json({ ok: true, name: file.name, size: bytes.byteLength });
}
