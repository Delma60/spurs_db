import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`CREATE TABLE IF NOT EXISTS "spurs"."subscriptions" (
    "project_id" uuid PRIMARY KEY NOT NULL,
    "plan" text DEFAULT 'free' NOT NULL,
    "status" text DEFAULT 'active' NOT NULL,
    "renews_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS "spurs"."invoices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "project_id" uuid NOT NULL,
    "plan" text NOT NULL,
    "amount" text NOT NULL,
    "currency" text DEFAULT 'NGN' NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL,
    "pay_reference" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "paid_at" timestamp with time zone)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "spurs"."subscriptions" ADD CONSTRAINT "subscriptions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "spurs"."projects"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN
    ALTER TABLE "spurs"."invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "spurs"."projects"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE INDEX IF NOT EXISTS "invoices_project_idx" ON "spurs"."invoices" ("project_id")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "invoices_pay_reference_idx" ON "spurs"."invoices" ("pay_reference")`;
  console.log("billing tables ready");
} finally { await sql.end(); }
