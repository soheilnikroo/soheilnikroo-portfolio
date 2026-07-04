export function describeDatabaseUrl(url: string): string {
  try {
    const normalized = url.replace(/^postgresql:/i, "http:");
    const parsed = new URL(normalized);
    const user = decodeURIComponent(parsed.username);
    const port = parsed.port || "5432";
    const pooler = parsed.hostname.includes("pooler.supabase.com") ? "pooler" : "direct";
    return `${user}@${parsed.hostname}:${port} (${pooler})`;
  } catch {
    return "invalid DATABASE_URL";
  }
}

export function normalizeEnvDatabaseUrl(raw?: string): string | null {
  const value = raw?.trim().replace(/^["']|["']$/g, "");
  if (!value) return null;
  try {
    new URL(value.replace(/^postgres(ql)?:/i, "http:"));
    return value;
  } catch {
    return null;
  }
}

/** Session pooler uses postgres.PROJECT; direct uses postgres@db.PROJECT.supabase.co. */
export function deriveSupabaseDirectUrl(poolerUrl: string): string | null {
  try {
    const parsed = new URL(poolerUrl.replace(/^postgresql:/i, "http:"));
    const user = decodeURIComponent(parsed.username);
    if (!user.startsWith("postgres.")) return null;
    const projectRef = user.slice("postgres.".length);
    if (!projectRef) return null;
    const auth = parsed.password ? `postgres:${parsed.password}` : "postgres";
    const path = parsed.pathname || "/postgres";
    return `postgresql://${auth}@db.${projectRef}.supabase.co:5432${path}`;
  } catch {
    return null;
  }
}

function deriveSupabaseTransactionPoolerUrl(url: string): string | null {
  if (!url.includes("pooler.supabase.com") || !/:5432(?:\/|$)/.test(url)) return null;
  return url.replace(":5432", ":6543");
}

/** Ordered fallbacks for flaky WAN / DNS (Liara → Supabase). */
export function listDatabaseUrlCandidates(): string[] {
  const primary = normalizeEnvDatabaseUrl(process.env.DATABASE_URL);
  if (!primary) return [];

  const seen = new Set<string>();
  const candidates: string[] = [];
  const add = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(resolveRuntimeDatabaseUrl(url));
  };

  add(primary);
  add(normalizeEnvDatabaseUrl(process.env.DATABASE_URL_DIRECT));
  if (isSupabaseUrl(primary)) {
    add(deriveSupabaseDirectUrl(primary));
    add(deriveSupabaseTransactionPoolerUrl(primary));
  }

  return candidates;
}

export function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.com") || url.includes("supabase.co");
}
export function isTransactionPooler(url: string): boolean {
  return isSupabaseUrl(url) && /:6543(?:\/|$)/.test(url);
}

function isServerlessRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Production Node hosts (e.g. Liara) — not Vercel/Lambda. Use fresh DB sockets per request. */
export function needsEphemeralDbConnections(): boolean {
  return process.env.NODE_ENV === "production" && !isServerlessRuntime();
}

/** Transaction pooler (:6543) is required for short-lived serverless workers. */
export function resolveRuntimeDatabaseUrl(url: string): string {
  if (!isServerlessRuntime() || !isSupabaseUrl(url)) return url;
  if (url.includes("pooler.supabase.com") && /:5432(?:\/|$)/.test(url)) {
    return url.replace(":5432", ":6543");
  }
  return url;
}

export function getPostgresClientOptions(url: string) {
  const serverless = isServerlessRuntime();
  const ephemeral = needsEphemeralDbConnections();
  const supabase = isSupabaseUrl(url);
  return {
    max: serverless || ephemeral ? 1 : 10,
    idle_timeout: serverless || ephemeral ? 5 : 20,
    connect_timeout: ephemeral ? 60 : serverless ? 15 : 45,
    prepare: supabase ? false : !isTransactionPooler(url),
    // Poolers can drop connections during the type-catalog handshake on long WAN paths.
    fetch_types: supabase ? false : undefined,
    ssl: supabase ? ("require" as const) : undefined,
    onnotice: () => {},
    connection: {
      application_name: "soheilnikroo",
    },
  };
}
