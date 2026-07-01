"use client";
import Link from "next/link";
import * as React from "react";

import type { PostMeta } from "@/lib/schemas";
import { formatDate } from "@/lib/services/date";
import { cn } from "@/lib/utils";
import { PIXEL_CARD } from "@/lib/world/world-theme";

import { filterPosts } from "../use-cases/filter-posts";

export function BlogIndex({ posts, categories }: { posts: PostMeta[]; categories: string[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const filtered = React.useMemo(
    () => filterPosts(posts, query, category),
    [posts, query, category],
  );
  const chipClass = (on: boolean) =>
    cn(
      "rounded-[3px] border-2 px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:outline-none",
      on
        ? "border-emerald-500/60 bg-emerald-100/80 text-emerald-900 dark:border-emerald-400/60 dark:bg-emerald-900/40 dark:text-emerald-100"
        : "border-pixel-border/35 bg-pixel-panel text-pixel-fg-muted hover:border-pixel-border/55",
    );
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search writing…"
          aria-label="Search writing"
          className="w-full max-w-xs rounded-[3px] border-2 border-pixel-border/35 bg-pixel-panel px-3 py-2 text-sm text-pixel-fg outline-none placeholder:text-pixel-fg-muted/70 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:focus-visible:border-emerald-400/50 dark:focus-visible:ring-emerald-400/30"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(category === null)}
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={chipClass(category === c)}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-4">
        {filtered.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className={cn(
                PIXEL_CARD,
                "group block p-5 transition-transform hover:-translate-y-0.5 hover:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:outline-none dark:hover:border-emerald-300/40",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-pixel-fg-muted">
                <span className="rounded-[2px] border border-emerald-500/40 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-200/90">
                  {post.category}
                </span>
                <span>{formatDate(post.date)}</span>
                <span>· {post.readingMinutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-pixel-fg group-hover:text-emerald-800 dark:group-hover:text-emerald-50">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-pixel-fg-muted">{post.description}</p>
              <span className="mt-3 inline-block text-sm text-emerald-700 transition-transform group-hover:translate-x-0.5 dark:text-emerald-200/90">
                Open chest →
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-[4px] border-2 border-dashed border-pixel-border/40 bg-pixel-panel p-10 text-center text-pixel-fg-muted">
            No posts match your search.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
