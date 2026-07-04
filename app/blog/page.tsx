import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { JsonLd } from "@/components/seo/json-ld";
import { BlogIndex } from "@/features/blog/components/blog-index";
import { getAllCategories, getAllPostMeta } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { ogImageEntries, pageTwitter } from "@/lib/seo/metadata-helpers";
import { breadcrumbListLd, graphLd } from "@/lib/seo/structured-data";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const copy = site.pages.blog;
  const title = copy.title;
  return {
    title,
    description: copy.description,
    alternates: { canonical: "/blog" },
    openGraph: {
      type: "website",
      title,
      description: copy.description,
      url: `${site.url}/blog`,
      images: ogImageEntries(site.url, "/opengraph-image"),
    },
    twitter: pageTwitter(title, copy.description, site.twitterHandle),
  };
}
export default async function BlogPage() {
  const [posts, categories, site] = await Promise.all([
    getAllPostMeta(),
    getAllCategories(),
    getSiteConfig(),
  ]);
  const copy = site.pages.blog;
  const blogLd = graphLd(
    breadcrumbListLd(site.url, [
      { name: "Home", path: "/" },
      { name: copy.title, path: "/blog" },
    ]),
    {
      "@type": "Blog",
      name: copy.title,
      description: copy.description,
      url: `${site.url}/blog`,
      inLanguage: "en",
      author: { "@type": "Person", name: site.name, url: site.url },
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `${site.url}/blog/${post.slug}`,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
      })),
    },
  );
  return (
    <PixelPage>
      <JsonLd data={blogLd} />
      <Container className="py-section">
        <header className="max-w-2xl">
          {copy.eyebrow ? (
            <p className="text-xs tracking-[0.3em] text-emerald-700/80 uppercase dark:text-emerald-300/80">
              {copy.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          {copy.subtitle ? <p className="mt-3 text-muted-foreground">{copy.subtitle}</p> : null}
        </header>
        <div className="mt-10">
          <BlogIndex posts={posts} categories={categories} />
        </div>
      </Container>
    </PixelPage>
  );
}
