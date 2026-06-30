import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { getProfile, saveProfile } from "@/lib/data/profile";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { ProfileSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    await saveProfile(parsed.data);
    revalidateContent();
    return NextResponse.json({ profile: parsed.data });
  } catch {
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}
