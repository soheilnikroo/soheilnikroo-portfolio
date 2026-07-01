import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PixelPage } from "@/components/layout/pixel-page";
import { site } from "@/lib/config/site";
import { getProjectBySlug, getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";
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
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — Soheil Nikroo`,
      description: project.summary,
      url: `/work/${slug}`,
    },
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
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const all = await getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const accent = project.accent ?? "#a5b4fc";
  const shots = project.screenshots.length > 0 ? project.screenshots : [null, null, null];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.title,
        abstract: project.summary,
        url: `${site.url}/work/${slug}`,
        keywords: project.tech.join(", "),
        creator: { "@type": "Person", name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${site.url}/work` },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: `${site.url}/work/${slug}`,
          },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PixelPage>
        <Container className="py-section">
          <Link href="/work" className="text-sm text-white/60 transition-colors hover:text-white">
            ← Projects
          </Link>

          <header className="mt-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/55">
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
            <h1 className="mt-3 text-4xl font-black [text-shadow:3px_3px_0_#000] sm:text-6xl">
              {project.title}
            </h1>
            <p className="mt-3 text-lg text-white/70">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-[2px] border border-white/15 px-2 py-0.5 text-xs text-white/65"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {project.links.live ? (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[3px] border-2 border-black bg-[#6366f1] px-4 py-2 text-sm text-white shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5"
                >
                  Visit live ↗
                </a>
              ) : null}
              {project.links.repo ? (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[3px] border-2 border-white/30 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/60"
                >
                  Source ↗
                </a>
              ) : null}
              {project.links.caseStudy ? (
                <a
                  href={project.links.caseStudy}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[3px] border-2 border-white/30 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/60"
                >
                  Case study ↗
                </a>
              ) : null}
            </div>
          </header>

          <section className="mt-10">
            <h2 className="text-xs tracking-[0.3em] text-amber-300/80 uppercase">Screens</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shots.map((src, i) =>
                src ? (
                  <div
                    key={src}
                    className="relative aspect-video overflow-hidden rounded-[4px] border-2 border-white/15"
                  >
                    <Image
                      src={src}
                      alt={`${project.title} screenshot ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex aspect-video items-center justify-center rounded-[4px] border-2 border-dashed border-white/20 bg-[#0d0b16] px-4 text-center text-xs leading-relaxed text-white/40"
                  >
                    Drop a screenshot in
                    <br />
                    public/work/{project.slug}/
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mt-12 grid gap-6 sm:grid-cols-2">
            {BEATS.map((b) => (
              <div key={b.key} className="rounded-[4px] border-2 border-white/12 bg-[#0d0b16] p-5">
                <h3 className="text-xs tracking-[0.24em] uppercase" style={{ color: accent }}>
                  {b.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {project.narrative[b.key]}
                </p>
              </div>
            ))}
          </section>

          <nav className="mt-14 flex items-center justify-between gap-4 border-t-2 border-white/12 pt-6 text-sm">
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="text-white/70 hover:text-white">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="text-right text-white/70 hover:text-white"
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
