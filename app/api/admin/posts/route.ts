import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/session";
import { createPost, listAllPostRows } from "@/lib/data/posts";
import { PostInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await listAllPostRows(true);
  return NextResponse.json({ posts: rows });
}
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json().catch(() => null);
  const parsed = PostInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const row = await createPost(parsed.data);
    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath("/read");
    revalidatePath("/admin");
    return NextResponse.json({ post: row }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "A post with that slug already exists."
        : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
