import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { deletePost, updatePost } from "@/lib/data/posts";
import { PostInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
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
  const parsed = PostInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const row = await updatePost(id, parsed.data);
    if (!row) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    revalidatePath("/blog");
    revalidatePath(`/blog/${row.slug}`);
    revalidatePath("/");
    revalidatePath("/read");
    revalidatePath("/admin");
    return NextResponse.json({ post: row });
  } catch (error) {
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "A post with that slug already exists."
        : "Failed to update post.";
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
  const ok = await deletePost(id);
  if (!ok) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/read");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
