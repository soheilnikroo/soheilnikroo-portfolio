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
export function isTransactionPooler(url: string): boolean {
  return isSupabaseUrl(url) && /:6543(?:\/|$)/.test(url);
}

function isServerlessRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
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
  return {
    max: serverless ? 1 : 10,
    idle_timeout: serverless ? 5 : 20,
    connect_timeout: serverless ? 15 : 30,
    prepare: isSupabaseUrl(url) ? false : !isTransactionPooler(url),
    ssl: isSupabaseUrl(url) ? ("require" as const) : undefined,
    onnotice: () => {},
    connection: {
      application_name: "soheilnikroo",
    },
  };
}
