import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

export default function Quickstart() {
  return (
    <div>
      <H1>Quickstart</H1>
      <Lead>Make your first API call in under a minute.</Lead>

      <H2>1. Create a project</H2>
      <P>Open the console, create a project, and note its name and region.</P>

      <H2>2. Get an API key</H2>
      <P>
        In <IC>Settings → API keys</IC>, create a key. It&apos;s shown once — copy it somewhere safe. All API requests
        authenticate with it:
      </P>
      <CodeBlock lang="http" code={`Authorization: Bearer sk_your_key_here`} />

      <H2>3. Create a table</H2>
      <P>In the <IC>Database</IC> service, add a table (for example <IC>posts</IC>) with a couple of columns.</P>

      <H2>4. Insert a row</H2>
      <CodeBlock
        lang="bash"
        code={`curl -X POST https://your-app/api/v1/db/posts \\
  -H "Authorization: Bearer sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Hello", "body": "My first post" }'`}
      />

      <H2>5. Read it back</H2>
      <CodeBlock
        lang="bash"
        code={`curl https://your-app/api/v1/db/posts?limit=10 \\
  -H "Authorization: Bearer sk_your_key_here"`}
      />

      <H2>Next steps</H2>
      <Ul>
        <li>Store files with <IC>Storage</IC>.</li>
        <li>Sync live data with the <IC>Realtime Database</IC>.</li>
        <li>Sign your own users in with <IC>Authentication</IC>.</li>
      </Ul>
    </div>
  );
}
