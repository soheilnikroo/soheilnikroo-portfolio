import { NextResponse } from "next/server";
import postgres from "postgres";

import { isAdmin } from "@/lib/auth/session";
import {
  describeDatabaseUrl,
  getPostgresClientOptions,
  listDatabaseUrlCandidates,
  needsEphemeralDbConnections,
} from "@/lib/db/connection-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidates = listDatabaseUrlCandidates();
  if (candidates.length === 0) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not set" }, { status: 503 });
  }

  const results: Array<{
    target: string;
    ok: boolean;
    latencyMs: number;
    error?: string;
    row?: { db: string; ts: Date };
  }> = [];

  for (const url of candidates) {
    const sql = postgres(url, { ...getPostgresClientOptions(url), max: 1 });
    const started = Date.now();
    try {
      const rows = await sql`select current_database() as db, now() as ts`;
      results.push({
        target: describeDatabaseUrl(url),
        ok: true,
        latencyMs: Date.now() - started,
        row: rows[0] as { db: string; ts: Date },
      });
    } catch (error) {
      results.push({
        target: describeDatabaseUrl(url),
        ok: false,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await sql.end({ timeout: 5 }).catch(() => {});
    }
  }

  const ok = results.some((result) => result.ok);
  return NextResponse.json(
    {
      ok,
      results,
      runtime: {
        ephemeral: needsEphemeralDbConnections(),
        nodeEnv: process.env.NODE_ENV,
      },
    },
    { status: ok ? 200 : 503 },
  );
}
