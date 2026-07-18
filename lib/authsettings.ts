import { db, authSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

export interface Smtp {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
  secure?: boolean;
}
export interface EmailTemplate {
  subject: string;
  body: string;
}
export interface Templates {
  verify: EmailTemplate;
  reset: EmailTemplate;
}
export interface AuthSettings {
  providers: Record<string, boolean>;
  allowSignups: boolean;
  smtp: Smtp;
  templates: Templates;
}

export const DEFAULT_TEMPLATES: Templates = {
  verify: {
    subject: "Verify your email",
    body: "Hi {{email}},\n\nConfirm your email address by clicking the link below:\n\n{{link}}\n\nIf you didn’t create this account, you can ignore this email.",
  },
  reset: {
    subject: "Reset your password",
    body: "Hi {{email}},\n\nReset your password using the link below:\n\n{{link}}\n\nIf you didn’t request this, you can safely ignore this email.",
  },
};

export async function getAuthSettings(projectId: string): Promise<AuthSettings> {
  const [row] = await db.select().from(authSettings).where(eq(authSettings.projectId, projectId)).limit(1);
  const templates = (row?.templates as Partial<Templates>) ?? {};
  return {
    providers: (row?.providers as Record<string, boolean>) ?? {},
    allowSignups: row?.allowSignups ?? true,
    smtp: (row?.smtp as Smtp) ?? {},
    templates: {
      verify: { ...DEFAULT_TEMPLATES.verify, ...(templates.verify ?? {}) },
      reset: { ...DEFAULT_TEMPLATES.reset, ...(templates.reset ?? {}) },
    },
  };
}

async function save(projectId: string, next: AuthSettings): Promise<void> {
  await db
    .insert(authSettings)
    .values({
      projectId,
      providers: next.providers,
      allowSignups: next.allowSignups,
      smtp: next.smtp,
      templates: next.templates,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: authSettings.projectId,
      set: {
        providers: next.providers,
        allowSignups: next.allowSignups,
        smtp: next.smtp,
        templates: next.templates,
        updatedAt: new Date(),
      },
    });
}

export async function setProvider(projectId: string, provider: string, enabled: boolean): Promise<void> {
  const cur = await getAuthSettings(projectId);
  await save(projectId, { ...cur, providers: { ...cur.providers, [provider]: enabled } });
}

export async function setAllowSignups(projectId: string, allow: boolean): Promise<void> {
  const cur = await getAuthSettings(projectId);
  await save(projectId, { ...cur, allowSignups: allow });
}

export async function setSmtp(projectId: string, smtp: Smtp): Promise<void> {
  const cur = await getAuthSettings(projectId);
  await save(projectId, { ...cur, smtp });
}

export async function setTemplates(projectId: string, templates: Templates): Promise<void> {
  const cur = await getAuthSettings(projectId);
  await save(projectId, { ...cur, templates });
}

export async function isProviderEnabled(projectId: string, provider: string): Promise<boolean> {
  return (await getAuthSettings(projectId)).providers[provider] === true;
}
