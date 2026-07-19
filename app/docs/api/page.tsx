import { H1, Lead, H2, P, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

const ROWS: { method: string; path: string; desc: string }[] = [
  { method: "GET", path: "/api/v1/db/<table>", desc: "List rows (filter by ?col=value, ?limit=n)" },
  { method: "POST", path: "/api/v1/db/<table>", desc: "Insert a row" },
  { method: "PATCH", path: "/api/v1/db/<table>?id=", desc: "Update a row" },
  { method: "DELETE", path: "/api/v1/db/<table>?id=", desc: "Delete a row" },
  { method: "GET", path: "/api/v1/rtdb/<path>", desc: "Read a realtime value" },
  { method: "PUT", path: "/api/v1/rtdb/<path>", desc: "Write a realtime value" },
  { method: "DELETE", path: "/api/v1/rtdb/<path>", desc: "Delete a realtime path" },
  { method: "POST", path: "/api/v1/auth/signup", desc: "Create an end user" },
  { method: "POST", path: "/api/v1/auth/signin", desc: "Sign an end user in" },
  { method: "GET", path: "/api/v1/auth/user", desc: "Get the current end user" },
  { method: "POST", path: "/api/v1/functions/<name>", desc: "Invoke a function" },
];

const COLORS: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  PATCH: "text-violet-400",
  DELETE: "text-red-400",
};

export default function ApiReference() {
  return (
    <div>
      <H1>API reference</H1>
      <Lead>Every project service, behind one base URL and one key.</Lead>

      <H2>Authentication</H2>
      <P>Send your project API key as a bearer token (or <IC>x-api-key</IC>) on every request:</P>
      <CodeBlock lang="http" code={`Authorization: Bearer sk_your_key_here`} />

      <H2>Endpoints</H2>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-800">
            {ROWS.map((r) => (
              <tr key={r.method + r.path}>
                <td className={`whitespace-nowrap px-4 py-2.5 font-mono text-xs font-semibold ${COLORS[r.method]}`}>{r.method}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-zinc-300">{r.path}</td>
                <td className="px-4 py-2.5 text-zinc-400">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Responses</H2>
      <P>
        Successful calls return <IC>{`{ "data": ... }`}</IC>; errors return <IC>{`{ "error": "message" }`}</IC> with an
        appropriate HTTP status. A missing or invalid key returns <IC>401</IC>.
      </P>
    </div>
  );
}
