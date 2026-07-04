import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { createProject, listAllProjectRows } from "@/lib/data/projects";
import { revalidateContent } from "@/lib/data/revalidate-content";
import { ProjectSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await listAllProjectRows();
    return NextResponse.json({ projects: rows });
  } catch (error) {
    console.warn("[admin/projects] read failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Content store unavailable" }, { status: 503 });
  }
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
    revalidateContent();
    revalidatePath("/work");
    revalidatePath("/");
    revalidatePath("/read");
    revalidatePath("/admin/projects");
    return NextResponse.json({ project: row }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "A project with that slug already exists."
        : "Failed to create project.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
