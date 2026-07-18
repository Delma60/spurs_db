import { NextRequest, NextResponse } from "next/server";
import { projectFromKey } from "@/lib/api/public";
import { runFunctionByName } from "@/lib/functions";

// Public function invocation: POST /api/v1/functions/<name> with an API key.
export async function POST(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const projectId = await projectFromKey(req);
  if (!projectId) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  const input = await req.json().catch(() => ({}));
  try {
    const { result, error } = await runFunctionByName(projectId, name, input);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
