import { defineConfig } from "drizzle-kit";

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
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

const isSupabase = !!process.env.SUPABASE_DATABASE_URL;
if (isSupabase) {
  databaseUrl = getSupabasePoolerUrl(databaseUrl);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: isSupabase ? "require" : undefined,
  },
});
