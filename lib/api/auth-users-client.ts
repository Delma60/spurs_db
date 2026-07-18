const base = "/api/internal/auth/users";

export interface EndUser {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? "Request failed");
  return body as T;
}

export async function fetchEndUsers(project: string): Promise<EndUser[]> {
  return (await json<{ users: EndUser[] }>(await fetch(`${base}?project=${project}`))).users;
}

export async function createEndUser(project: string, email: string, password: string): Promise<void> {
  await json(
    await fetch(`${base}?project=${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function deleteEndUser(project: string, id: string): Promise<void> {
  await json(await fetch(`${base}/${id}?project=${project}`, { method: "DELETE" }));
}

export interface Smtp {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
  secure?: boolean;
}
export interface EmailTemplate { subject: string; body: string }
export interface Templates { verify: EmailTemplate; reset: EmailTemplate }
export interface AuthSettings {
  providers: Record<string, boolean>;
  allowSignups: boolean;
  smtp: Smtp;
  templates: Templates;
}

export async function fetchAuthSettings(project: string): Promise<AuthSettings> {
  return json<AuthSettings>(await fetch(`/api/internal/auth/settings?project=${project}`));
}

export async function setProvider(project: string, provider: string, enabled: boolean): Promise<AuthSettings> {
  return json<AuthSettings>(
    await fetch(`/api/internal/auth/settings?project=${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, enabled }),
    }),
  );
}

export async function setAllowSignups(project: string, allowSignups: boolean): Promise<AuthSettings> {
  return json<AuthSettings>(
    await fetch(`/api/internal/auth/settings?project=${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowSignups }),
    }),
  );
}

export async function saveSmtp(project: string, smtp: Smtp): Promise<AuthSettings> {
  return json<AuthSettings>(
    await fetch(`/api/internal/auth/settings?project=${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smtp }),
    }),
  );
}

export async function saveTemplates(project: string, templates: Templates): Promise<AuthSettings> {
  return json<AuthSettings>(
    await fetch(`/api/internal/auth/settings?project=${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates }),
    }),
  );
}
