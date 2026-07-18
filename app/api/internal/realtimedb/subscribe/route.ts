import { NextRequest } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { sql } from "@/lib/db";
import { rtdbChannel } from "@/lib/realtimedb";

export const dynamic = "force-dynamic";

// Notifies the browser (SSE) whenever the Realtime Database tree changes.
export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  const channel = rtdbChannel(auth.project.id);
  const encoder = new TextEncoder();
  let unlisten: (() => Promise<void>) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      send(`event: ready\ndata: {}\n\n`);
      const sub = await sql.listen(channel, () => send(`data: changed\n\n`));
      unlisten = sub.unlisten;
      heartbeat = setInterval(() => send(`: ping\n\n`), 25000);
    },
    async cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (unlisten) await unlisten();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
