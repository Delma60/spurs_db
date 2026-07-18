// Spurs BaaS control-plane schema (Postgres, on Neon).
// Lives in a dedicated `spurs` schema — the platform's own tables, distinct
// from any per-project/tenant data.
import {
  pgSchema,
  text,
  uuid,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

export const spurs = pgSchema("spurs");

/** A developer, mirrored from the Spurs SSO `sub` claim (their accounts id). */
export const users = spurs.table("users", {
  id: text("id").primaryKey(), // Spurs `sub`
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** A BaaS project (like a Firebase project / Supabase project). */
export const projects = spurs.table(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    region: text("region").default("us-east").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("projects_owner_idx").on(t.ownerId)],
);

/** Project membership + role (owner/admin/member). */
export const projectMembers = spurs.table(
  "project_members",
  {
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

/** API keys a project issues to its own client apps. */
export const apiKeys = spurs.table("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revoked: boolean("revoked").notNull().default(false),
});

/** Logical storage buckets a project defines (objects live in one physical B2 bucket, keyed by prefix). */
export const storageBuckets = spurs.table(
  "storage_buckets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    public: boolean("public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("storage_buckets_project_name_idx").on(t.projectId, t.name)],
);

/** A project's own end users (auth-as-a-service). Passwords live here in the
 * control plane, NOT in the tenant's queryable schema. */
export const endUsers = spurs.table(
  "end_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("end_users_project_email_idx").on(t.projectId, t.email)],
);

/** Serverless functions a project defines. */
export const functions = spurs.table(
  "functions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("functions_project_name_idx").on(t.projectId, t.name)],
);

/** Per-project auth configuration — which sign-in providers are enabled. */
export const authSettings = spurs.table("auth_settings", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  providers: jsonb("providers").notNull().default({}), // { password: true, spurs: true, ... }
  allowSignups: boolean("allow_signups").notNull().default(true),
  smtp: jsonb("smtp").notNull().default({}), // { host, port, username, password, from, secure }
  templates: jsonb("templates").notNull().default({}), // { verify:{subject,body}, reset:{subject,body} }
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** One JSON tree per project — the Realtime Database root. */
export const realtimeData = spurs.table("realtime_data", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type StorageBucket = typeof storageBuckets.$inferSelect;
export type EndUser = typeof endUsers.$inferSelect;
export type FunctionRow = typeof functions.$inferSelect;
export type AuthSettingsRow = typeof authSettings.$inferSelect;
