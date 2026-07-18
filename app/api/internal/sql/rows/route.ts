import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { listColumns, listRows, insertRow, deleteRow } from "@/lib/db/tables";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const auth = await authorizeProject(params.get("project"));
  if ("error" in auth) return auth.error;

  const table = params.get("table");
  if (!table) return NextResponse.json({ error: "Missing table" }, { status: 400 });

  try {
    const [columns, rows] = await Promise.all([
      listColumns(auth.project.id, table),
      listRows(auth.project.id, table),
    ]);
    return NextResponse.json({ columns, rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const row = await insertRow(auth.project.id, String(body.table ?? ""), body.values ?? {});
    return NextResponse.json({ row });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const auth = await authorizeProject(params.get("project"));
  if ("error" in auth) return auth.error;

  const table = params.get("table");
  const id = params.get("id");
  if (!table || !id) return NextResponse.json({ error: "Missing table or id" }, { status: 400 });

  try {
    await deleteRow(auth.project.id, table, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
