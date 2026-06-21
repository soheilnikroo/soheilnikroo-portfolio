import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { BlogIndex } from "@/features/blog/components/blog-index";
import { getAllCategories, getAllPostMeta } from "@/lib/data";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on motion, front-end architecture, and building for the web.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getAllPostMeta(), getAllCategories()]);
  return (
    <Container className="py-section">
      <header className="max-w-[var(--prose)]">
        <p className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Writing
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Notes & essays
        </h1>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          Thoughts on motion, performance, accessibility, and front-end architecture.
        </p>
      </header>
      <div className="mt-12">
        <BlogIndex posts={posts} categories={categories} />
      </div>
    </Container>
  );
}
