import { NextRequest, NextResponse } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { getAuthSettings, setProvider, setAllowSignups, setSmtp, setTemplates } from "@/lib/authsettings";

export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;
  return NextResponse.json(await getAuthSettings(auth.project.id));
}

export async function PUT(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  if (typeof body.provider === "string" && typeof body.enabled === "boolean") {
    await setProvider(auth.project.id, body.provider, body.enabled);
  }
  if (typeof body.allowSignups === "boolean") {
    await setAllowSignups(auth.project.id, body.allowSignups);
  }
  if (body.smtp && typeof body.smtp === "object") {
    await setSmtp(auth.project.id, body.smtp);
  }
  if (body.templates && typeof body.templates === "object") {
    await setTemplates(auth.project.id, body.templates);
  }
  return NextResponse.json(await getAuthSettings(auth.project.id));
}
