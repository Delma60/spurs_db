const base = "/api/internal/apikeys";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchKeys(project: string): Promise<ApiKey[]> {
  return (await json<{ keys: ApiKey[] }>(await fetch(`${base}?project=${project}`))).keys;
}

export async function createKey(project: string, name: string): Promise<{ key: string; prefix: string }> {
  return json(
    await fetch(`${base}?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),
  );
}

export async function revokeKey(project: string, id: string): Promise<void> {
  await json(await fetch(`${base}/${id}?project=${project}`, { method: "DELETE" }));
}
