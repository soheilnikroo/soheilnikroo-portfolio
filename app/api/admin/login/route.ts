import { NextResponse } from "next/server";

import { adminAuthConfigError } from "@/lib/auth/config";
import { isSameOriginRequest } from "@/lib/auth/origin";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import {
  checkPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const configError = adminAuthConfigError();
  if (configError) {
    return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  }

  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    password?: unknown;
  };
  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return response;
}
