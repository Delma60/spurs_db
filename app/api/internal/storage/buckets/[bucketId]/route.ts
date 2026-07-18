import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { deleteBucket } from "@/lib/storage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bucketId: string }> },
) {
  const { bucketId } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  await deleteBucket(auth.project.id, bucketId);
  return NextResponse.json({ ok: true });
}
