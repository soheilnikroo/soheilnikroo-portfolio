import { getSiteUrl } from "@/lib/data/site-settings";

function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  for (const candidate of [
    getSiteUrl(),
    "https://soheilnikroo.liara.run",
    "https://soheilnikroo.com",
    "https://www.soheilnikroo.com",
  ]) {
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL
    }
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

export function isSameOriginRequest(request: Request): boolean {
  const allowed = allowedOrigins();
  const origin = request.headers.get("origin");
  if (origin && allowed.has(origin)) return true;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      if (allowed.has(new URL(referer).origin)) return true;
    } catch {
      return false;
    }
  }

  const host = request.headers.get("host");
  if (host) {
    const requestOrigin = `https://${host}`;
    if (origin === requestOrigin) return true;
    if (referer) {
      try {
        return new URL(referer).origin === requestOrigin;
      } catch {
        return false;
      }
    }
  }

  return false;
}
