const base = "/api/internal/functions";

export interface FnSummary { id: string; name: string; updatedAt: string }
export interface Fn { id: string; name: string; code: string; updatedAt: string }
export interface RunResult { result?: unknown; logs: string[]; error?: string }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchFunctions(project: string): Promise<FnSummary[]> {
  return (await json<{ functions: FnSummary[] }>(await fetch(`${base}?project=${project}`))).functions;
}
export async function getFunction(project: string, id: string): Promise<Fn> {
  return (await json<{ function: Fn }>(await fetch(`${base}/${id}?project=${project}`))).function;
}
export async function createFunction(project: string, name: string): Promise<Fn> {
  return (await json<{ function: Fn }>(await fetch(`${base}?project=${project}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
  }))).function;
}
export async function updateFunction(project: string, id: string, code: string): Promise<void> {
  await json(await fetch(`${base}/${id}?project=${project}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
  }));
}
export async function deleteFunction(project: string, id: string): Promise<void> {
  await json(await fetch(`${base}/${id}?project=${project}`, { method: "DELETE" }));
}
export async function runFunction(project: string, id: string, input: unknown): Promise<RunResult> {
  return json(await fetch(`${base}/${id}/run?project=${project}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input }),
  }));
}
