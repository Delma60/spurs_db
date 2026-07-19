import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listMembers, addMemberByEmail, isOwner } from "@/lib/members";

// GET /api/internal/members?project=<id>  → project members
export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json({ members: await listMembers(auth.project.id) });
}

// POST /api/internal/members?project=<id>  { email, role }  → invite a member
export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  if (!(await isOwner(auth.project.id, auth.session.sub))) {
    return NextResponse.json({ error: "Only the owner can manage members" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "");
  const role = body.role === "admin" ? "admin" : "member";
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  try {
    const res = await addMemberByEmail(auth.project.id, email, role);
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
