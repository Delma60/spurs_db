const base = "/api/internal/realtimedb";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchTree(project: string): Promise<unknown> {
  return (await json<{ data: unknown }>(await fetch(`${base}?project=${project}`))).data;
}

export async function setPath(project: string, path: string, value: unknown): Promise<void> {
  await json(
    await fetch(`${base}?project=${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, value }),
    }),
  );
}

export async function removePath(project: string, path: string): Promise<void> {
  await json(await fetch(`${base}?project=${project}&path=${encodeURIComponent(path)}`, { method: "DELETE" }));
}
