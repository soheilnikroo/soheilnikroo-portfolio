/** Parse DATABASE_URL for logging and client options (never log the password). */
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

export function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.com") || url.includes("supabase.co");
}

/** Transaction pooler (6543) cannot use prepared statements. Session pooler (5432) can. */
export function isTransactionPooler(url: string): boolean {
  return isSupabaseUrl(url) && /:6543(?:\/|$)/.test(url);
}

export function getPostgresClientOptions(url: string) {
  return {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: !isTransactionPooler(url),
    ssl: isSupabaseUrl(url) ? ("require" as const) : undefined,
    connection: {
      application_name: "soheilnikroo",
    },
  };
}
