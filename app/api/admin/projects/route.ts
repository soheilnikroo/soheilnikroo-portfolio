import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { createProject, listAllProjectRows } from "@/lib/data/projects";
import { ProjectSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await listAllProjectRows();
  return NextResponse.json({ projects: rows });
}
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = ProjectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const row = await createProject(parsed.data);
    return NextResponse.json({ project: row }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "A project with that slug already exists."
        : "Failed to create project.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
