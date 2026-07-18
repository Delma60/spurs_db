import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { addColumn, dropColumn } from "@/lib/db/tables";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    await addColumn(auth.project.id, table, {
      name: String(body.name ?? ""),
      type: body.type,
      nullable: body.nullable ?? true,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> },
) {
  const { table } = await params;
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  const column = req.nextUrl.searchParams.get("column");
  if (!column) return NextResponse.json({ error: "Missing column" }, { status: 400 });

  try {
    await dropColumn(auth.project.id, table, column);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
