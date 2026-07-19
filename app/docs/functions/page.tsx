import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

export default function FunctionsDocs() {
  return (
    <div>
      <H1>Functions</H1>
      <Lead>Run backend logic on demand, without managing servers.</Lead>

      <P>
        Write a function in the console editor, then invoke it over HTTP at{" "}
        <IC>/api/v1/functions/&lt;name&gt;</IC>. Functions run in an isolated sandbox with a strict time limit.
      </P>

      <H2>Write a function</H2>
      <P>A function receives the request body as <IC>input</IC> and returns a value:</P>
      <CodeBlock lang="javascript" code={`// greet
function handler(input) {
  return { message: "Hello, " + input.name };
}`} />

      <H2>Invoke it</H2>
      <CodeBlock lang="bash" code={`curl -X POST https://your-app/api/v1/functions/greet \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Ada" }'`} />

      <H2>Notes</H2>
      <Ul>
        <li>Each run is sandboxed and capped by a timeout, so runaway loops are stopped automatically.</li>
        <li>Test functions right in the console before you ship.</li>
      </Ul>
    </div>
  );
}
