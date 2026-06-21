"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type { PostMeta } from "@/lib/schemas";
import { formatDate } from "@/lib/services/date";
import { cn } from "@/lib/utils";

export function BlogIndex({ posts, categories }: { posts: PostMeta[]; categories: string[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search writing…"
          aria-label="Search writing"
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={category === null ? "default" : "outline"}
            onClick={() => setCategory(null)}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-4">
        {filtered.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className={cn(
                "block rounded-2xl border border-border/70 p-6 transition-colors hover:border-foreground/40 hover:bg-muted/40",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                  {post.category}
                </span>
                <span>{formatDate(post.date)}</span>
                <span>· {post.readingMinutes} min read</span>
              </div>
              <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-2 text-pretty text-muted-foreground">{post.description}</p>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            No posts match your search.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
