import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

export default function RealtimeDocs() {
  return (
    <div>
      <H1>Realtime Database</H1>
      <Lead>A single live JSON tree per project, synced across every client.</Lead>

      <P>
        Read and write any path in the tree at <IC>/api/v1/rtdb/&lt;path&gt;</IC>. Writes notify every subscribed
        client instantly — ideal for presence, chat, dashboards and collaborative state.
      </P>

      <H2>Write a value</H2>
      <CodeBlock lang="bash" code={`curl -X PUT https://your-app/api/v1/rtdb/rooms/lobby/message \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "value": "Hello everyone" }'`} />

      <H2>Read a value</H2>
      <CodeBlock lang="bash" code={`curl https://your-app/api/v1/rtdb/rooms/lobby \\
  -H "Authorization: Bearer sk_..."`} />

      <H2>Delete a path</H2>
      <CodeBlock lang="bash" code={`curl -X DELETE https://your-app/api/v1/rtdb/rooms/lobby/message \\
  -H "Authorization: Bearer sk_..."`} />

      <H2>Subscribe to changes</H2>
      <P>The console shows a live feed of changes. Writes propagate to subscribers over a streaming connection, so UIs update without polling.</P>

      <H2>Notes</H2>
      <Ul>
        <li>Paths are slash-separated, like <IC>rooms/lobby/message</IC>.</li>
        <li>Values can be any JSON — strings, numbers, objects or arrays.</li>
      </Ul>
    </div>
  );
}
