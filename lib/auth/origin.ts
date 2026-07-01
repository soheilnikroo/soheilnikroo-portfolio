import { getSiteUrl } from "@/lib/data/site-settings";

function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  const siteUrl = getSiteUrl();

  try {
    origins.add(new URL(siteUrl).origin);
  } catch {
    // ignore invalid configured site URL
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) return allowedOrigins().has(origin);

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowedOrigins().has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}
