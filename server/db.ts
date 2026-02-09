import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function getSupabasePoolerUrl(directUrl: string): string {
  const url = new URL(directUrl);
  if (url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co")) {
    const projectRef = url.hostname.replace("db.", "").replace(".supabase.co", "");
    const password = url.password;
    return `postgresql://postgres.${projectRef}:${password}@aws-1-eu-central-2.pooler.supabase.com:5432/postgres`;
  }
  return directUrl;
}

let databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isSupabase = !!process.env.SUPABASE_DATABASE_URL;
if (isSupabase) {
  databaseUrl = getSupabasePoolerUrl(databaseUrl);
}

const finalUrl = new URL(databaseUrl);
console.log(`[db] Connecting to ${finalUrl.hostname}:${finalUrl.port} as ${finalUrl.username}`);

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
