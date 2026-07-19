import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

export default function DatabaseDocs() {
  return (
    <div>
      <H1>Database</H1>
      <Lead>Relational tables with an instant, secure REST API.</Lead>

      <P>
        Create tables and columns in the console, then read and write rows over the API. Every table is exposed at{" "}
        <IC>/api/v1/db/&lt;table&gt;</IC> and scoped to your project.
      </P>

      <H2>Insert a row</H2>
      <CodeBlock lang="bash" code={`curl -X POST https://your-app/api/v1/db/posts \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Hello", "published": true }'`} />

      <H2>Query rows</H2>
      <P>Filter with equality on any column, and cap results with <IC>limit</IC>:</P>
      <CodeBlock lang="bash" code={`curl "https://your-app/api/v1/db/posts?published=true&limit=20" \\
  -H "Authorization: Bearer sk_..."`} />

      <H2>Update a row</H2>
      <CodeBlock lang="bash" code={`curl -X PATCH "https://your-app/api/v1/db/posts?id=42" \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Updated title" }'`} />

      <H2>Delete a row</H2>
      <CodeBlock lang="bash" code={`curl -X DELETE "https://your-app/api/v1/db/posts?id=42" \\
  -H "Authorization: Bearer sk_..."`} />

      <H2>Notes</H2>
      <Ul>
        <li>Responses are plain JSON: <IC>{`{ "data": ... }`}</IC> on success, <IC>{`{ "error": ... }`}</IC> on failure.</li>
        <li>Column and table names are validated; values are always sent as parameters.</li>
        <li>The built-in SQL editor in the console runs in a sandbox scoped to your project only.</li>
      </Ul>
    </div>
  );
}
