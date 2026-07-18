import { NextRequest } from "next/server";
import { authorizeProject } from "@/lib/api/guard";
import { sql } from "@/lib/db";
import { schemaName } from "@/lib/db/tables";

export const dynamic = "force-dynamic";

// Server-Sent Events stream of live row changes for a project. The browser
// connects with EventSource (cookies included), we LISTEN on the project's
// channel and forward each NOTIFY payload.
export async function GET(req: NextRequest) {
  const auth = await authorizeProject(req.nextUrl.searchParams.get("project"));
  if ("error" in auth) return auth.error;

  const channel = schemaName(auth.project.id);
  const encoder = new TextEncoder();

  let unlisten: (() => Promise<void>) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: string) => controller.enqueue(encoder.encode(line));
      send(`event: ready\ndata: {}\n\n`);

      const sub = await sql.listen(channel, (payload) => {
        send(`data: ${payload}\n\n`);
      });
      unlisten = sub.unlisten;

      heartbeat = setInterval(() => send(`: ping\n\n`), 25000);
    },
    async cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (unlisten) await unlisten();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
