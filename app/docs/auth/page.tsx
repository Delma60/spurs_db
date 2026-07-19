import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";
import CodeBlock from "@/components/docs/CodeBlock";

export default function AuthDocs() {
  return (
    <div>
      <H1>Authentication</H1>
      <Lead>Sign your own app&apos;s users in — email &amp; password out of the box.</Lead>

      <P>
        Each project gets its own isolated set of end users, separate from your Spurs account. Enable providers in the
        console under <IC>Authentication</IC>, then call the endpoints below from your app.
      </P>

      <H2>Sign up</H2>
      <CodeBlock lang="bash" code={`curl -X POST https://your-app/api/v1/auth/signup \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "password": "secret123" }'`} />

      <H2>Sign in</H2>
      <P>Returns a token you store on the client and send as the user&apos;s bearer token.</P>
      <CodeBlock lang="bash" code={`curl -X POST https://your-app/api/v1/auth/signin \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "password": "secret123" }'`} />

      <H2>Get the current user</H2>
      <CodeBlock lang="bash" code={`curl https://your-app/api/v1/auth/user \\
  -H "Authorization: Bearer <user-token>"`} />

      <H2>Notes</H2>
      <Ul>
        <li>Passwords are hashed; the raw value is never stored or returned.</li>
        <li>Toggle sign-ups and providers (including Spurs SSO) per project in the console.</li>
      </Ul>
    </div>
  );
}
