import { NextResponse } from "next/server";
import type { z } from "zod";

import { isAdmin } from "@/lib/auth/session";
import { saveMilestones } from "@/lib/data/milestones";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { saveSkillGraph } from "@/lib/data/skills";
import { MilestonesSchema, SkillGraphSchema } from "@/lib/schemas";
import type { Milestones } from "@/lib/schemas/milestone";
import type { SkillGraph } from "@/lib/schemas/skill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SiteKey = "skills" | "milestones";

const schemas: Record<SiteKey, z.ZodType<SkillGraph | Milestones>> = {
  skills: SkillGraphSchema,
  milestones: MilestonesSchema,
};

const savers: Record<SiteKey, (data: SkillGraph | Milestones) => Promise<void>> = {
  skills: (data) => saveSkillGraph(data as SkillGraph),
  milestones: (data) => saveMilestones(data as Milestones),
};

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  if (key !== "skills" && key !== "milestones") {
    return NextResponse.json({ error: "Unknown content key" }, { status: 404 });
  }

  const contentKey = key as SiteKey;
  const json = await request.json().catch(() => null);
  const parsed = schemas[contentKey].safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid content", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    await savers[contentKey](parsed.data);
    revalidateContent();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}
