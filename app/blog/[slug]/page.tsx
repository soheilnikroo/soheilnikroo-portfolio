import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import prettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getAllPostMeta, getPostMetaBySlug, getPostSource } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { pageTwitter, resolveOgImage } from "@/lib/seo/metadata-helpers";
import { breadcrumbListLd, graphLd } from "@/lib/seo/structured-data";
import { formatDate } from "@/lib/services/date";
import { extractToc } from "@/lib/services/toc";
import { PIXEL_CARD } from "@/lib/world/world-theme";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getAllPostMeta();
  return posts.map((post) => ({ slug: post.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [meta, siteConfig] = await Promise.all([getPostMetaBySlug(slug), getSiteConfig()]);
  if (!meta) return {};
  const ogImage = resolveOgImage(siteConfig.url, meta.cover, `/blog/${slug}/opengraph-image`);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: `/blog/${slug}`,
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
      tags: meta.tags,
      images: [{ url: ogImage, alt: meta.title }],
    },
    twitter: pageTwitter(meta.title, meta.description, siteConfig.twitterHandle),
  };
}
export default async function PostPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const [source, siteConfig] = await Promise.all([getPostSource(slug), getSiteConfig()]);
  if (!source) notFound();
  const toc = extractToc(source.content);
  const { content } = await compileMDX({
    source: source.content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [
            prettyCode,
            { theme: { dark: "github-dark", light: "github-light" }, keepBackground: true },
          ],
        ],
      },
    },
  });
  const meta = source.meta;
  const postUrl = `${siteConfig.url}/blog/${slug}`;
  const imageUrl = meta.cover
    ? meta.cover.startsWith("http")
      ? meta.cover
      : `${siteConfig.url}${meta.cover.startsWith("/") ? meta.cover : `/${meta.cover}`}`
    : `${postUrl}/opengraph-image`;
  const articleLd = graphLd(
    breadcrumbListLd(siteConfig.url, [
      { name: "Home", path: "/" },
      { name: siteConfig.pages.blog.title, path: "/blog" },
      { name: meta.title, path: `/blog/${slug}` },
    ]),
    {
      "@type": "BlogPosting",
      headline: meta.title,
      description: meta.description,
      datePublished: meta.date,
      dateModified: meta.updated ?? meta.date,
      url: postUrl,
      image: imageUrl,
      inLanguage: "en",
      author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
      publisher: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
      mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
      keywords: meta.tags.join(", "),
    },
  );
  return (
    <PixelPage>
      <JsonLd data={articleLd} />
      <Container className="py-section">
        <Link
          href="/blog"
          className="text-sm text-pixel-fg-muted transition-colors hover:text-emerald-700 dark:hover:text-emerald-200"
        >
          ← Writing
        </Link>

        <article className="mt-8 grid gap-12 lg:grid-cols-[1fr_200px]">
          <div className="min-w-0">
            {toc.length > 0 ? (
              <details className={`mb-6 p-4 lg:hidden ${PIXEL_CARD}`}>
                <summary className="cursor-pointer text-[10px] tracking-[0.24em] text-emerald-700/80 uppercase dark:text-emerald-300/80">
                  On this page
                </summary>
                <ul className="mt-3 space-y-2 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-pixel-fg-muted transition-colors hover:text-emerald-700 dark:hover:text-emerald-200"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            <header className="max-w-[var(--prose)]">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-[2px] border border-emerald-500/40 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-200/90">
                  {meta.category}
                </span>
                <span>{formatDate(meta.date)}</span>
                <span>· {meta.readingMinutes} min read</span>
              </div>
              <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {meta.title}
              </h1>
              <p className="mt-4 text-lg text-pretty text-muted-foreground">{meta.description}</p>
            </header>
            <div className="prose mt-10 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-emerald-700 dark:prose-a:text-emerald-300 prose-pre:border-2 prose-pre:border-pixel-border/25">
              {content}
            </div>
          </div>

          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className={`sticky top-24 p-4 ${PIXEL_CARD}`}>
                <p className="mb-3 text-[10px] tracking-[0.24em] text-emerald-700/80 uppercase dark:text-emerald-300/80">
                  On this page
                </p>
                <ul className="space-y-2 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-pixel-fg-muted transition-colors hover:text-emerald-700 dark:hover:text-emerald-200"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          ) : null}
        </article>
      </Container>
    </PixelPage>
  );
}
