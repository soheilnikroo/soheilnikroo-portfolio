import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { deleteProject, getProjectRow, updateProject } from "@/lib/data/projects";
import { ProjectSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = await getProjectRow(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: row });
}
export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = ProjectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const row = await updateProject(id, parsed.data);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project: row });
  } catch (error) {
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "A project with that slug already exists."
        : "Failed to update project.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteProject(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
