import { NextResponse } from "next/server";
import postgres from "postgres";

import { isAdmin } from "@/lib/auth/session";
import {
  describeDatabaseUrl,
  getPostgresClientOptions,
  needsEphemeralDbConnections,
} from "@/lib/db/connection-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!url) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not set" }, { status: 503 });
  }

  const target = describeDatabaseUrl(url);
  const sql = postgres(url, { ...getPostgresClientOptions(url), max: 1 });
  const started = Date.now();

  try {
    const rows = await sql`select current_database() as db, now() as ts`;
    return NextResponse.json({
      ok: true,
      target,
      latencyMs: Date.now() - started,
      row: rows[0],
      runtime: {
        ephemeral: needsEphemeralDbConnections(),
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        target,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
        runtime: {
          ephemeral: needsEphemeralDbConnections(),
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 503 },
    );
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}
