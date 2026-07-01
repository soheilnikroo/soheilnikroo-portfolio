"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";

import type { AdminPost } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelCls = "block text-sm font-medium";
export function PostEditor({ mode, post }: { mode: "create" | "edit"; post?: AdminPost }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = React.useState(post?.title ?? "");
  const [slug, setSlug] = React.useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post?.slug));
  const [description, setDescription] = React.useState(post?.description ?? "");
  const [category, setCategory] = React.useState(post?.category ?? "");
  const [tags, setTags] = React.useState((post?.tags ?? []).join(", "));
  const [date, setDate] = React.useState(post?.date ?? today);
  const [published, setPublished] = React.useState(post?.published ?? false);
  const [body, setBody] = React.useState(post?.body ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const effectiveSlug = slugTouched ? slug : slugify(title);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      slug: effectiveSlug,
      title,
      description,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      body,
      published,
      date,
    };
    const url = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${post?.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    setError(data.error ?? "Failed to save. Check the fields and try again.");
    setSaving(false);
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {mode === "create" ? "New post" : "Edit post"}
        </h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Published
        </label>
      </div>

      <div>
        <label className={labelCls} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={`mt-1 ${field}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className={`mt-1 ${field}`}
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">/blog/{effectiveSlug || "…"}</p>
      </div>

      <div>
        <label className={labelCls} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={2}
          className={`mt-1 ${field}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            className={`mt-1 ${field}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            className={`mt-1 ${field}`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            className={`mt-1 ${field}`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="body">
          Body (Markdown / MDX)
        </label>
        <textarea
          id="body"
          rows={18}
          className={`mt-1 font-mono text-sm ${field}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
