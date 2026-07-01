import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { getAllPostMeta, getProjects } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { PIXEL_CARD, PIXEL_HEADING_SHADOW } from "@/lib/world/world-theme";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const copy = site.pages.work;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: "/work" },
    openGraph: {
      type: "website",
      title: `${copy.title} — ${site.name}`,
      description: copy.description,
      url: `${site.url}/work`,
    },
  };
}
const STATUS_LABEL: Record<string, string> = {
  live: "LIVE",
  "in-progress": "WIP",
  archived: "ARCHIVED",
  concept: "CONCEPT",
};
export default async function WorkPage() {
  const [projects, posts, site] = await Promise.all([
    getProjects(),
    getAllPostMeta(),
    getSiteConfig(),
  ]);
  const copy = site.pages.work;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: copy.title, item: `${site.url}/work` },
    ],
  };
  return (
    <PixelPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Container className="py-section">
        <Link
          href="/"
          className="text-sm text-pixel-fg-muted transition-colors hover:text-pixel-fg"
        >
          {copy.backLink}
        </Link>

        <header className="mt-6 max-w-2xl">
          {copy.eyebrow ? (
            <p className="text-xs tracking-[0.3em] text-amber-700/80 uppercase dark:text-amber-300/80">
              {copy.eyebrow}
            </p>
          ) : null}
          <h1 className={`mt-3 text-4xl font-black sm:text-5xl ${PIXEL_HEADING_SHADOW}`}>
            {copy.title}
          </h1>
          {copy.subtitle ? <p className="mt-3 text-pixel-fg-muted">{copy.subtitle}</p> : null}
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className={`group p-5 transition-transform hover:-translate-y-1 ${PIXEL_CARD}`}
            >
              <div
                aria-hidden="true"
                className="mb-4 h-36 w-full overflow-hidden rounded-[3px] border border-pixel-border/25"
                style={{
                  background: p.cover
                    ? `center / cover no-repeat url(${p.cover})`
                    : `linear-gradient(135deg, ${p.accent ?? "#6366f1"}55, var(--pixel-panel) 75%)`,
                }}
              />
              <div className="flex items-center justify-between text-[10px] text-pixel-fg-muted">
                <span>
                  {p.role} · {p.year}
                </span>
                <span
                  className="rounded-[2px] border px-1.5 py-0.5"
                  style={{
                    borderColor: `${p.accent ?? "#6366f1"}88`,
                    color: p.accent ?? "#a5b4fc",
                  }}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-pixel-fg-muted">{p.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tech.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-[2px] border border-pixel-border/30 px-1.5 py-0.5 text-[10px] text-pixel-fg-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-block text-sm text-amber-700 transition-transform group-hover:translate-x-0.5 dark:text-amber-200">
                {copy.enterLabel}
              </span>
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-xs tracking-[0.3em] text-emerald-700/80 uppercase dark:text-emerald-200/80">
              {copy.latestWriting}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`block p-4 transition-colors hover:border-emerald-500/50 dark:hover:border-emerald-300/50 ${PIXEL_CARD}`}
                  >
                    <div className="text-[10px] text-pixel-fg-muted/80">
                      {post.category} · {post.readingMinutes} min
                    </div>
                    <p className="mt-1 text-sm font-semibold">{post.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              className="mt-4 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-200"
            >
              {copy.allWriting}
            </Link>
          </section>
        ) : null}
      </Container>
    </PixelPage>
  );
}
