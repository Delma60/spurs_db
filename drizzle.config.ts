import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env the same way Next.js does, so the CLI sees DATABASE_SYNC_URL.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_SYNC_URL! },
  schemaFilter: ["spurs"],
  verbose: true,
  strict: true,
});
