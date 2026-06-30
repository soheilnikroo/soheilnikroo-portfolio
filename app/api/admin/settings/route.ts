import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { getSiteSettings, saveSiteSettings } from "@/lib/data/site-settings";
import { SiteSettingsSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
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
