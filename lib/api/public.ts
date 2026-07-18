import type { NextRequest } from "next/server";
import { resolveProjectByKey } from "@/lib/apikeys";

/** The bearer token / x-api-key on a request. */
export function bearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("x-api-key");
}

/** Resolve the project from a request's API key (or null). */
export async function projectFromKey(req: NextRequest): Promise<string | null> {
  const key = bearer(req);
  return key ? resolveProjectByKey(key) : null;
}
