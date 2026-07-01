"use client";
import Link from "next/link";
import * as React from "react";

import type { PostMeta } from "@/lib/schemas";
import { formatDate } from "@/lib/services/date";
import { cn } from "@/lib/utils";

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
      "rounded-[3px] border-2 px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
      on
        ? "border-emerald-400/60 bg-emerald-900/40 text-emerald-100"
        : "border-white/20 bg-[#0d0b16] text-white/65 hover:border-white/35",
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
          className="w-full max-w-xs rounded-[3px] border-2 border-white/20 bg-[#0d0b16] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-400/30"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(category === null)}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={chipClass(category === c)}
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
              className="group block rounded-[4px] border-2 border-white/12 bg-[#0d0b16] p-5 shadow-[3px_3px_0_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 hover:border-emerald-300/40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/50">
                <span className="rounded-[2px] border border-emerald-500/40 px-1.5 py-0.5 text-emerald-200/90">
                  {post.category}
                </span>
                <span>{formatDate(post.date)}</span>
                <span>· {post.readingMinutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-white group-hover:text-emerald-50">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-white/60">{post.description}</p>
              <span className="mt-3 inline-block text-sm text-emerald-200/90 transition-transform group-hover:translate-x-0.5">
                Open chest →
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-[4px] border-2 border-dashed border-white/20 bg-[#0d0b16] p-10 text-center text-white/50">
            No posts match your search.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
