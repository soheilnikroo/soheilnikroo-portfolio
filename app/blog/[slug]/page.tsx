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
import { site } from "@/lib/config/site";
import { getPostMetaBySlug, getPostSource } from "@/lib/data";
import { formatDate } from "@/lib/services/date";
import { extractToc } from "@/lib/services/toc";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPostMetaBySlug(slug);
  if (!meta) return {};
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
    },
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
  const source = await getPostSource(slug);
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
          [prettyCode, { theme: "github-dark", keepBackground: true }],
        ],
      },
    },
  });
  const meta = source.meta;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    author: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${slug}`,
    keywords: meta.tags.join(", "),
  };
  return (
    <PixelPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Container className="py-section">
        <Link
          href="/blog"
          className="text-sm text-white/60 transition-colors hover:text-emerald-200"
        >
          ← Writing
        </Link>

        <article className="mt-8 grid gap-12 lg:grid-cols-[1fr_200px]">
          <div className="min-w-0">
            <header className="max-w-[var(--prose)]">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/50">
                <span className="rounded-[2px] border border-emerald-500/40 px-1.5 py-0.5 text-emerald-200/90">
                  {meta.category}
                </span>
                <span>{formatDate(meta.date)}</span>
                <span>· {meta.readingMinutes} min read</span>
              </div>
              <h1 className="mt-4 text-4xl font-black [text-shadow:3px_3px_0_#000] sm:text-5xl">
                {meta.title}
              </h1>
              <p className="mt-4 text-lg text-pretty text-white/65">{meta.description}</p>
            </header>
            <div className="prose mt-10 max-w-none prose-invert prose-headings:font-bold prose-a:text-emerald-300 prose-pre:border-2 prose-pre:border-white/10">
              {content}
            </div>
          </div>

          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <nav
                aria-label="On this page"
                className="sticky top-24 rounded-[4px] border-2 border-white/12 bg-[#0d0b16] p-4"
              >
                <p className="mb-3 text-[10px] tracking-[0.24em] text-emerald-300/80 uppercase">
                  On this page
                </p>
                <ul className="space-y-2 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-white/55 transition-colors hover:text-emerald-200"
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
