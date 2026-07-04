import { describe, expect, it } from "vitest";

import {
  deriveSupabaseDirectUrl,
  listDatabaseUrlCandidates,
  normalizeEnvDatabaseUrl,
} from "./connection-url";

describe("deriveSupabaseDirectUrl", () => {
  it("maps session pooler URL to direct host with postgres user", () => {
    const pooler =
      "postgresql://postgres.myref:secret%40word@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
    expect(deriveSupabaseDirectUrl(pooler)).toBe(
      "postgresql://postgres:secret%40word@db.myref.supabase.co:5432/postgres",
    );
  });
});

describe("listDatabaseUrlCandidates", () => {
  it("includes derived direct and transaction pooler fallbacks", () => {
    const pooler =
      "postgresql://postgres.myref:secret@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
    process.env.DATABASE_URL = pooler;
    delete process.env.DATABASE_URL_DIRECT;

    const candidates = listDatabaseUrlCandidates();
    expect(candidates).toEqual([
      pooler,
      "postgresql://postgres:secret@db.myref.supabase.co:5432/postgres",
      "postgresql://postgres.myref:secret@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
    ]);
  });

  it("prefers explicit DATABASE_URL_DIRECT after primary", () => {
    const pooler =
      "postgresql://postgres.myref:secret@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
    const direct = "postgresql://postgres:secret@db.myref.supabase.co:5432/postgres";
    process.env.DATABASE_URL = pooler;
    process.env.DATABASE_URL_DIRECT = direct;

    const candidates = listDatabaseUrlCandidates();
    expect(candidates[0]).toBe(pooler);
    expect(candidates[1]).toBe(direct);
  });
});

describe("normalizeEnvDatabaseUrl", () => {
  it("strips surrounding quotes", () => {
    expect(normalizeEnvDatabaseUrl('"postgresql://postgres:pw@host:5432/postgres"')).toBe(
      "postgresql://postgres:pw@host:5432/postgres",
    );
  });
});
