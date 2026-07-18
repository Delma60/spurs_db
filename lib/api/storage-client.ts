// Client-safe wrapper over the internal Storage API.
const base = "/api/internal/storage";

export interface Bucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
}
export interface StoredObject {
  name: string;
  size: number;
  lastModified: string | null;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchBuckets(project: string): Promise<Bucket[]> {
  return (await json<{ buckets: Bucket[] }>(await fetch(`${base}/buckets?project=${project}`))).buckets;
}

export async function createBucket(project: string, name: string, isPublic: boolean): Promise<void> {
  await json(
    await fetch(`${base}/buckets?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, public: isPublic }),
    }),
  );
}

export async function deleteBucket(project: string, bucketId: string): Promise<void> {
  await json(await fetch(`${base}/buckets/${bucketId}?project=${project}`, { method: "DELETE" }));
}

export async function fetchObjects(project: string, bucketId: string): Promise<StoredObject[]> {
  return (
    await json<{ objects: StoredObject[] }>(
      await fetch(`${base}/objects?project=${project}&bucket=${bucketId}`),
    )
  ).objects;
}

export async function uploadFile(project: string, bucketId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await json(
    await fetch(`${base}/upload?project=${project}&bucket=${bucketId}`, { method: "POST", body: form }),
  );
}

export async function deleteObject(project: string, bucketId: string, name: string): Promise<void> {
  await json(
    await fetch(`${base}/objects?project=${project}&bucket=${bucketId}&name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    }),
  );
}

export async function downloadUrl(project: string, bucketId: string, name: string): Promise<string> {
  return (
    await json<{ url: string }>(
      await fetch(`${base}/download?project=${project}&bucket=${bucketId}&name=${encodeURIComponent(name)}`),
    )
  ).url;
}
