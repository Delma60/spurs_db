import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Neon Postgres via postgres.js. Reuse a single client across hot reloads.
const globalForDb = globalThis as unknown as { _pg?: ReturnType<typeof postgres> };

const client =
  globalForDb._pg ??
  postgres(process.env.DATABASE_SYNC_URL!, {
    ssl: "require",
    max: 5,
    prepare: false, // safest for serverless/pooled Postgres (Neon)
  });

if (process.env.NODE_ENV !== "production") globalForDb._pg = client;

export const db = drizzle(client, { schema });
/** Raw postgres.js client — for dynamic, per-project DDL/DML (Database service). */
export const sql = client;
export * from "./schema";
