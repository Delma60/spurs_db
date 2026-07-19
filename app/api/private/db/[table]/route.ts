import { NextRequest, NextResponse } from "next/server";
import { authorizeInternalService } from "@/lib/api/internal-guard";
import { queryRows, insertRow, updateRow, deleteRow } from "@/lib/db/tables";

// Private service-to-service data API. Trusted Spurs services (Pay, Billing…)
// call it with the shared secret:
//   x-internal-secret: <INTERNAL_API_SECRET>   ?project=<projectId>

export async function GET(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const auth = await authorizeInternalService(req);
  if ("error" in auth) return auth.error;

  const filters: Record<string, string> = {};
  let limit = 100;
  for (const [k, v] of req.nextUrl.searchParams) {
    if (k === "project") continue;
    if (k === "limit") limit = Number(v) || 100;
    else filters[k] = v;
  }
  try {
    return NextResponse.json({ data: await queryRows(auth.project.id, table, filters, limit) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const auth = await authorizeInternalService(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    return NextResponse.json({ data: await insertRow(auth.project.id, table, body) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const auth = await authorizeInternalService(req);
  if ("error" in auth) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = await req.json();
    const row = await updateRow(auth.project.id, table, id, body);
    if (!row) return NextResponse.json({ error: "Row not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const auth = await authorizeInternalService(req);
  if ("error" in auth) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await deleteRow(auth.project.id, table, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
