import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { BlogIndex } from "@/features/blog/components/blog-index";
import { getAllCategories, getAllPostMeta } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on motion, front-end architecture, and building for the web.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Writing",
    description: "Notes on motion, front-end architecture, and building for the web.",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getAllPostMeta(), getAllCategories()]);
  return (
    <PixelPage>
      <Container className="py-section">
        <header className="max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-emerald-300/80 uppercase">▶ The vault</p>
          <h1 className="mt-3 text-4xl font-black [text-shadow:3px_3px_0_#000] sm:text-5xl">
            Writing
          </h1>
          <p className="mt-3 text-white/65">
            Notes on motion, performance, accessibility, and front-end architecture.
          </p>
        </header>
        <div className="mt-10">
          <BlogIndex posts={posts} categories={categories} />
        </div>
      </Container>
    </PixelPage>
  );
}
