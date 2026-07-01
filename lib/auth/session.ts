import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const SESSION_COOKIE = "sn_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
function secret(): string {
  return process.env.SESSION_SECRET ?? "";
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
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  return safeEqual(input, expected);
}
export function createSessionToken(): string {
  const payload = b64url(JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 }));
  return `${payload}.${sign(payload)}`;
}
export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = readSessionExp(parsed);
    return exp !== null && exp > Date.now();
  } catch {
    return false;
  }
}
function readSessionExp(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("exp" in value)) return null;
  const exp = value.exp;
  return typeof exp === "number" ? exp : null;
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
