import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getProjectById } from "@/lib/projects";
import type { Project } from "@/lib/db";

type Authorized = { project: Project };
type Denied = { error: NextResponse };

function secretMatches(given: string): boolean {
  const expected = process.env.INTERNAL_API_SECRET ?? "";
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/**
 * Trusted service-to-service auth for `/api/private/*`. A Spurs platform service
 * (Pay, Billing, …) presents the shared INTERNAL_API_SECRET and the target
 * project — no per-user ownership, no public API key.
 */
export async function authorizeInternalService(req: NextRequest): Promise<Authorized | Denied> {
  const secret = req.headers.get("x-internal-secret") ?? "";
  if (!secretMatches(secret)) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const projectId = req.nextUrl.searchParams.get("project");
  if (!projectId) return { error: NextResponse.json({ error: "Missing project" }, { status: 400 }) };

  const project = await getProjectById(projectId);
  if (!project) return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };

  return { project };
}
