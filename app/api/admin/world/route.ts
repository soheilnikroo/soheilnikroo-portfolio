import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { getWorldNarrative, saveWorldNarrative } from "@/lib/data/world-narrative";
import { WorldNarrativeSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const world = await getWorldNarrative();
  return NextResponse.json({ world });
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
