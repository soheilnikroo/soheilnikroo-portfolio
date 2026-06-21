import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import prettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { Container } from "@/components/layout/container";
import { getAllPostMeta, getPostMetaBySlug, getPostSource } from "@/lib/data";
import { formatDate } from "@/lib/services/date";
import { extractToc } from "@/lib/services/toc";

export async function generateStaticParams() {
  const posts = await getAllPostMeta(true);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPostMetaBySlug(slug);
  if (!meta) return {};
  return { title: meta.title, description: meta.description };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
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

  return (
    <Container className="py-section">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Writing
      </Link>

      <article className="mt-8 grid gap-12 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          <header className="max-w-[var(--prose)]">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{meta.category}</span>
              <span>{formatDate(meta.date)}</span>
              <span>· {meta.readingMinutes} min read</span>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-4 text-lg text-pretty text-muted-foreground">{meta.description}</p>
          </header>
          <div className="prose mt-10 max-w-none prose-zinc dark:prose-invert">{content}</div>
        </div>

        {toc.length > 0 ? (
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24">
              <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                On this page
              </p>
              <ul className="space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
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
  );
}
