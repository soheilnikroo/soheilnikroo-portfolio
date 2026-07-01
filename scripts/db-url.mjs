/** Shared DATABASE_URL parsing for CLI scripts (seed, ping, list). */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv() {
  if (process.env.DATABASE_URL) return;

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    if (key !== "DATABASE_URL") continue;

    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env.DATABASE_URL = value;
  }
}

export function resolveDatabaseUrl() {
  loadDotEnv();

  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;

  const url = raw.replace(/^["']|["']$/g, "");
  try {
    new URL(url.replace(/^postgres(ql)?:/i, "http:"));
    return url;
  } catch {
    return null;
  }
}

export function describeDatabaseUrl(url) {
  try {
    const parsed = new URL(url.replace(/^postgres(ql)?:/i, "http:"));
    const port = parsed.port || "5432";
    return `${decodeURIComponent(parsed.username)}@${parsed.hostname}:${port}`;
  } catch {
    return "(unparseable URL)";
  }
}

export function printDatabaseUrlHelp() {
  console.error("DATABASE_URL is missing or not a valid Postgres URI.");
  console.error("");
  console.error("Expected format:");
  console.error(
    "  postgresql://postgres.PROJECT:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres",
  );
  console.error("");
  console.error("GitHub Actions / Liara secret checklist:");
  console.error("- Paste the full URI only (no surrounding quotes)");
  console.error("- No trailing spaces or newlines");
  console.error("- URL-encode special characters in the password (@ # = % & etc.)");
  console.error("- Must end with /postgres");
}
