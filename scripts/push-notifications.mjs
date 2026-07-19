import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`CREATE TABLE IF NOT EXISTS "spurs"."notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "title" text NOT NULL,
    "body" text,
    "href" text,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "spurs"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "spurs"."users"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "spurs"."notifications" ("user_id")`;
  console.log("notifications table ready");
} finally { await sql.end(); }
