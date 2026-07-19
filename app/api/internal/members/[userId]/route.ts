import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { removeMember, isOwner } from "@/lib/members";

// DELETE /api/internal/members/<userId>?project=<id>  → remove a member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  if (!(await isOwner(auth.project.id, auth.session.sub))) {
    return NextResponse.json({ error: "Only the owner can manage members" }, { status: 403 });
  }

  const { userId } = await params;
  if (userId === auth.session.sub) {
    return NextResponse.json({ error: "You can't remove yourself (the owner)" }, { status: 400 });
  }
  await removeMember(auth.project.id, userId);
  return NextResponse.json({ ok: true });
}
