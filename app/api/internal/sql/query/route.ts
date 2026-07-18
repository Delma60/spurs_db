import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { runSql } from "@/lib/db/tables";

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  try {
    const { query } = await req.json();
    if (!query || !String(query).trim()) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }
    const result = await runSql(auth.project.id, String(query));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
