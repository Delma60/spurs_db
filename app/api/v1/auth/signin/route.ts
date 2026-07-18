import { NextRequest, NextResponse } from "next/server";
import { projectFromKey } from "@/lib/api/public";
import { signIn } from "@/lib/endusers";

export async function POST(req: NextRequest) {
  const projectId = await projectFromKey(req);
  if (!projectId) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  try {
    const { email, password } = await req.json();
    const result = await signIn(projectId, String(email ?? ""), String(password ?? ""));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
