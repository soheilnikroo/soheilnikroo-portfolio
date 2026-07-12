import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { getWorldNarrative, saveWorldNarrative } from "@/lib/data/world-narrative";
import { logContentStoreError } from "@/lib/db/log-content-store";
import { WorldNarrativeSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const world = await getWorldNarrative();
    return NextResponse.json({ world });
  } catch (error) {
    logContentStoreError("world", error);
    return NextResponse.json({ error: "Content store unavailable" }, { status: 503 });
  }
}
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = WorldNarrativeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid world content", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    await saveWorldNarrative(parsed.data);
    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save world content." }, { status: 500 });
  }
}
