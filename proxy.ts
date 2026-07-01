import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/auth/origin";
import { ADMIN_API_PREFIX, isAdminPagePath, isProtectedAdminPath } from "@/lib/auth/paths";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { updateSession } from "@/lib/supabase/update-session";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isAdminRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

function withAdminNoIndex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith(ADMIN_API_PREFIX) &&
    MUTATING_METHODS.has(request.method) &&
    pathname !== "/api/admin/login" &&
    !isSameOriginRequest(request)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isProtectedAdminPath(pathname) && !isAdminRequest(request)) {
    if (pathname.startsWith(ADMIN_API_PREFIX)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  let response: NextResponse;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    response = await updateSession(request);
  } else {
    response = NextResponse.next({ request });
  }

  if (isAdminPagePath(pathname)) {
    withAdminNoIndex(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ogg|ico)$).*)",
  ],
};
