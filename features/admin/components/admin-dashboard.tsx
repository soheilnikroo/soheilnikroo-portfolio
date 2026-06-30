"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/services/date";

import type { AdminPost } from "./types";

export function AdminDashboard({
  initialPosts,
  dbError = false,
}: {
  initialPosts: AdminPost[];
  dbError?: boolean;
}) {
  const router = useRouter();
  const [posts, setPosts] = React.useState(initialPosts);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onDelete(post: AdminPost) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(post.id);
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      router.refresh();
    } else {
      window.alert("Failed to delete post.");
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Writing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} post{posts.length === 1 ? "" : "s"} · changes go live immediately
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/new">New post</Link>
          </Button>
          <Button variant="outline" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </div>

      {dbError ? (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Cannot reach the database. Set <code>DATABASE_URL</code> in <code>.env</code> and run{" "}
          <code>pnpm db:seed</code>. See <code>ADMIN.md</code>.
        </div>
      ) : null}

      <ul className="mt-8 grid gap-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 p-4"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={
                    post.published
                      ? "rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary"
                      : "rounded-full bg-muted px-2 py-0.5 font-medium"
                  }
                >
                  {post.published ? "Published" : "Draft"}
                </span>
                <span>{post.category}</span>
                <span>· {formatDate(post.date)}</span>
              </div>
              <p className="mt-1 truncate font-medium">{post.title}</p>
              <p className="truncate text-sm text-muted-foreground">/blog/{post.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              {post.published ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    View
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/${post.id}`}>Edit</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy === post.id}
                onClick={() => onDelete(post)}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            No posts yet. Create your first one.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
