import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { BlogIndex } from "@/features/blog/components/blog-index";
import { getAllCategories, getAllPostMeta } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const copy = site.pages.blog;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: "/blog" },
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
      url: `${site.url}/blog`,
    },
  };
}
export default async function BlogPage() {
  const [posts, categories, site] = await Promise.all([
    getAllPostMeta(),
    getAllCategories(),
    getSiteConfig(),
  ]);
  const copy = site.pages.blog;
  return (
    <PixelPage>
      <Container className="py-section">
        <header className="max-w-2xl">
          {copy.eyebrow ? (
            <p className="text-xs tracking-[0.3em] text-emerald-300/80 uppercase">{copy.eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-4xl font-black [text-shadow:3px_3px_0_#000] sm:text-5xl">
            {copy.title}
          </h1>
          {copy.subtitle ? <p className="mt-3 text-white/65">{copy.subtitle}</p> : null}
        </header>
        <div className="mt-10">
          <BlogIndex posts={posts} categories={categories} />
        </div>
      </Container>
    </PixelPage>
  );
}
