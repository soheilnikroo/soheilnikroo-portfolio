import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectScreens } from "@/components/work/project-screens";
import { TechBadges } from "@/components/work/tech-badges";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { pageTwitter, resolveOgImage } from "@/lib/seo/metadata-helpers";
import { breadcrumbListLd, graphLd } from "@/lib/seo/structured-data";
import { PIXEL_CARD, PIXEL_GHOST_BTN, PIXEL_PRIMARY_BTN } from "@/lib/world/world-theme";

export const revalidate = 300;
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [project, siteConfig] = await Promise.all([getProjectBySlug(slug), getSiteConfig()]);
  if (!project) return {};
  const ogTitle = `${project.title} — ${siteConfig.name}`;
  const ogImage = resolveOgImage(
    siteConfig.url,
    project.cover ?? project.screenshots[0],
    `/work/${slug}/opengraph-image`,
  );
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title: ogTitle,
      description: project.summary,
      url: `/work/${slug}`,
      images: [{ url: ogImage, alt: project.title }],
    },
    twitter: pageTwitter(ogTitle, project.summary, siteConfig.twitterHandle),
  };
}
const BEATS = [
  { key: "problem", label: "The problem" },
  { key: "challenge", label: "The challenge" },
  { key: "process", label: "The process" },
  { key: "solution", label: "The solution" },
  { key: "outcome", label: "The outcome" },
] as const;
export default async function ProjectPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const [project, all, siteConfig] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSiteConfig(),
  ]);
  if (!project) notFound();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const accent = project.accent ?? "#a5b4fc";
  const projectUrl = `${siteConfig.url}/work/${slug}`;
  const imageUrls = [...(project.cover ? [project.cover] : []), ...project.screenshots].map((src) =>
    src.startsWith("http") ? src : `${siteConfig.url}${src.startsWith("/") ? src : `/${src}`}`,
  );
  const ld = graphLd(
    breadcrumbListLd(siteConfig.url, [
      { name: "Home", path: "/" },
      { name: siteConfig.pages.work.title, path: "/work" },
      { name: project.title, path: `/work/${slug}` },
    ]),
    {
      "@type": "CreativeWork",
      name: project.title,
      abstract: project.summary,
      url: projectUrl,
      ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
      keywords: project.tech.join(", "),
      creator: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    },
  );
  return (
    <>
      <JsonLd data={ld} />
      <PixelPage>
        <Container className="py-section">
          <Link
            href="/work"
            className="text-sm text-pixel-fg-muted transition-colors hover:text-pixel-fg"
          >
            ← Projects
          </Link>

          <header className="mt-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-pixel-fg-muted">
              <span>{project.role}</span>
              <span>·</span>
              <span>{project.year}</span>
              <span
                className="rounded-[2px] border px-1.5 py-0.5 uppercase"
                style={{ borderColor: `${accent}88`, color: accent }}
              >
                {project.status}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
              {project.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{project.summary}</p>
            <div className="mt-4">
              <TechBadges items={project.tech} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {project.links.live ? (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer"
                  className={`${PIXEL_PRIMARY_BTN} px-4 py-2`}
                >
                  Visit live ↗<span className="sr-only"> (opens in new tab)</span>
                </a>
              ) : null}
              {project.links.repo ? (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noreferrer"
                  className={`${PIXEL_GHOST_BTN} px-4 py-2`}
                >
                  Source ↗<span className="sr-only"> (opens in new tab)</span>
                </a>
              ) : null}
              {project.links.caseStudy ? (
                <a
                  href={project.links.caseStudy}
                  target="_blank"
                  rel="noreferrer"
                  className={`${PIXEL_GHOST_BTN} px-4 py-2`}
                >
                  Case study ↗<span className="sr-only"> (opens in new tab)</span>
                </a>
              ) : null}
            </div>
          </header>

          <ProjectScreens
            title={project.title}
            slug={project.slug}
            accent={accent}
            galleryStyle={project.galleryStyle}
            cover={project.cover}
            screenshots={project.screenshots}
          />

          <section className="mt-12 grid gap-6 sm:grid-cols-2">
            {BEATS.map((b) => (
              <div key={b.key} className={`p-5 ${PIXEL_CARD}`}>
                <h3 className="text-xs tracking-[0.24em] uppercase" style={{ color: accent }}>
                  {b.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pixel-fg-muted">
                  {project.narrative[b.key]}
                </p>
              </div>
            ))}
          </section>

          <nav className="mt-14 flex items-center justify-between gap-4 border-t-2 border-pixel-border/30 pt-6 text-sm">
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="text-pixel-fg-muted hover:text-pixel-fg">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="text-right text-pixel-fg-muted hover:text-pixel-fg"
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </Container>
      </PixelPage>
    </>
  );
}
