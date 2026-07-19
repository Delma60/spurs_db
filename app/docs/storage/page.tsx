import { H1, Lead, H2, P, Ul, IC } from "@/components/docs/prose";

export default function StorageDocs() {
  return (
    <div>
      <H1>Storage</H1>
      <Lead>Buckets for files and media, scoped to your project.</Lead>

      <P>
        Create buckets in the console under <IC>Storage</IC>, then upload, browse, download and delete files. Each
        bucket can be public or private.
      </P>

      <H2>Buckets</H2>
      <Ul>
        <li><span className="text-zinc-200">Private</span> — files are reachable only through short-lived signed links.</li>
        <li><span className="text-zinc-200">Public</span> — files can be served directly to anyone with the link.</li>
      </Ul>

      <H2>Uploading</H2>
      <P>
        Upload files from the console file browser. Uploads stream through Spurs BaaS, so you don&apos;t configure any
        storage or CORS yourself. Files are organized per project and per bucket.
      </P>

      <H2>Downloading</H2>
      <P>
        Download any file from the browser. Private files are served through a signed URL that expires shortly after
        it&apos;s issued, so links can&apos;t be shared indefinitely.
      </P>

      <H2>Notes</H2>
      <Ul>
        <li>Storage is isolated per project — one project can never see another&apos;s files.</li>
        <li>Programmatic upload/download endpoints follow the same project API-key model as the other services.</li>
      </Ul>
    </div>
  );
}
