"use client";

import * as React from "react";

import { PostEditor } from "@/features/admin";
import { toAdminPost } from "@/lib/data/posts-admin";

import { AdminDbUnavailable } from "./admin-db-unavailable";
import { AdminPanelSkeleton } from "./admin-panel-skeleton";

export function PostEditorLoader({ id }: { id: string }) {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const [post, setPost] = React.useState<ReturnType<typeof toAdminPost> | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { post: Parameters<typeof toAdminPost>[0] };
        if (cancelled) return;
        setPost(toAdminPost(json.post));
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-[var(--prose)]">
        <AdminPanelSkeleton label="Loading post…" />
      </div>
    );
  }

  if (state === "error" || !post) {
    return (
      <div className="mx-auto max-w-[var(--prose)]">
        <AdminDbUnavailable />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--prose)]">
      <PostEditor mode="edit" post={post} />
    </div>
  );
}
