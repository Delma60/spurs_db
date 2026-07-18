// Spurs BaaS control-plane schema (Postgres, on Neon).
// Lives in a dedicated `spurs` schema — the platform's own tables, distinct
// from any per-project/tenant data.
import {
  pgSchema,
  text,
  uuid,
  timestamp,
  boolean,
  index,
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

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
