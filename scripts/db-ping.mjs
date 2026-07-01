#!/usr/bin/env node
import postgres from "postgres";

import { describeDatabaseUrl, printDatabaseUrlHelp, resolveDatabaseUrl } from "./db-url.mjs";

const url = resolveDatabaseUrl();
if (!url) {
  printDatabaseUrlHelp();
  process.exit(1);
}

const isTransactionPooler = url.includes("pooler.supabase.com") && /:6543(?:\/|$)/.test(url);
console.log("Target:", describeDatabaseUrl(url));
console.log("Pooler mode:", isTransactionPooler ? "transaction (6543)" : "session/direct (5432)");
const sql = postgres(url, {
  max: 1,
  connect_timeout: 30,
  prepare: !isTransactionPooler,
  ssl: url.includes("supabase.com") || url.includes("supabase.co") ? "require" : undefined,
});
try {
  const start = Date.now();
  const rows = await sql`SELECT current_database() AS db, now() AS ts`;
  console.log("OK in", `${Date.now() - start}ms`, rows[0]);
} catch (error) {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  console.error("\nTips:");
  console.error("- Copy the exact URI from Supabase → Connect (check aws-0 vs aws-1 hostname).");
  console.error("- Use Session pooler :5432, not Transaction :6543.");
  console.error("- On Liara: liara env list  (local .env is NOT uploaded by liara deploy)");
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
