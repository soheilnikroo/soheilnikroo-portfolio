import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { isAdminAuthConfigured } from "@/lib/auth/config";

export const SESSION_COOKIE = "sn_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function sessionVersion(): string {
  return createHmac("sha256", secret())
    .update(process.env.ADMIN_PASSWORD ?? "")
    .digest("hex")
    .slice(0, 16);
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  if (!isAdminAuthConfigured()) return false;
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const payload = b64url(
    JSON.stringify({
      exp: Date.now() + MAX_AGE_SECONDS * 1000,
      v: sessionVersion(),
    }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isAdminAuthConfigured()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = readSessionExp(parsed);
    const version = readSessionVersion(parsed);
    return exp !== null && exp > Date.now() && version === sessionVersion();
  } catch {
    return false;
  }
}

function readSessionExp(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("exp" in value)) return null;
  const exp = value.exp;
  return typeof exp === "number" ? exp : null;
}

function readSessionVersion(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("v" in value)) return null;
  const version = value.v;
  return typeof version === "string" ? version : null;
}
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
