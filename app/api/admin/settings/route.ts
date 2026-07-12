import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { getSiteSettingsLive, saveSiteSettings } from "@/lib/data/site-settings";
import { logContentStoreError } from "@/lib/db/log-content-store";
import { SiteSettingsSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = await getSiteSettingsLive();
    return NextResponse.json({ settings });
  } catch (error) {
    logContentStoreError("site", error);
    return NextResponse.json({ error: "Content store unavailable" }, { status: 503 });
  }
}
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = SiteSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    await saveSiteSettings(parsed.data);
    revalidateContent();
    return NextResponse.json({ settings: parsed.data });
  } catch {
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
