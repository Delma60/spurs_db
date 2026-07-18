import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listEndUsers, adminCreateUser } from "@/lib/endusers";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json({ users: await listEndUsers(auth.project.id) });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  try {
    const { email, password } = await req.json();
    const user = await adminCreateUser(auth.project.id, String(email ?? ""), String(password ?? ""));
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
