import { getAllPostMeta, getProfile, getProjects, getSkillGraph } from "@/lib/data";
import { getMilestones } from "@/lib/data/milestones";
import { getSiteConfig } from "@/lib/data/site-settings";
import { getWorldNarrative } from "@/lib/data/world-narrative";

import { absoluteUrl } from "./metadata-helpers";

function mdLink(baseUrl: string, path: string, label: string, note?: string): string {
  const url = absoluteUrl(baseUrl, path);
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`;
}

export async function buildLlmsTxt(): Promise<string> {
  const [site, profile, projects, posts, graph, world] = await Promise.all([
    getSiteConfig(),
    getProfile(),
    getProjects(),
    getAllPostMeta(),
    getSkillGraph(),
    getWorldNarrative(),
  ]);

  const base = site.url;
  const socialLines = profile.socials
    .filter((s) => s.platform !== "email")
    .map((s) => `- [${s.label}](${s.href})`)
    .join("\n");

  const projectLines = projects
    .slice(0, 12)
    .map((p) => mdLink(base, `/work/${p.slug}`, p.title, `${p.role} (${p.year}) — ${p.summary}`))
    .join("\n");

  const postLines = posts
    .slice(0, 15)
    .map((p) => mdLink(base, `/blog/${p.slug}`, p.title, `${p.category} — ${p.description}`))
    .join("\n");

  const skillSummary = graph.nodes
    .slice(0, 20)
    .map((n) => `${n.label} (${n.category}, level ${n.level}/5)`)
    .join("; ");

  return `# ${site.name}

> ${site.description}

${profile.name} is a ${profile.role.toLowerCase()} based in ${profile.location}. ${profile.tagline}

Important notes for AI crawlers and agents:
- The homepage (\`/\`) is an interactive scroll-scrubbed pixel-art experience. Prefer [\`/read\`](${absoluteUrl(base, "/read")}) for the complete text portfolio (projects, skills, writing, contact).
- All public pages expose JSON-LD structured data (Person, WebSite, BlogPosting, CreativeWork).
- Machine-readable feeds: [RSS](${absoluteUrl(base, "/rss.xml")}), [sitemap](${absoluteUrl(base, "/sitemap.xml")}).
- Extended content for retrieval: [llms-full.txt](${absoluteUrl(base, "/llms-full.txt")}).

## Key pages

${mdLink(base, "/read", "Read as a page", "Primary text-first portfolio — best starting point for AI summarization")}
${mdLink(base, "/work", site.pages.work.description)}
${mdLink(base, "/blog", site.pages.blog.description)}
${mdLink(base, "/", "Interactive homepage", site.pages.home.ogDescription)}

## About

- Name: ${profile.name}
- Role: ${profile.role}
- Location: ${profile.location}
- Summary: ${profile.summary}
- Intro: ${world.introProse.trim()}
- Core skills: ${skillSummary}

## Projects

${projectLines || "- (none published)"}

## Writing

${postLines || "- (none published)"}

## Contact

- Email: [${profile.email}](mailto:${profile.email})
${socialLines}
${profile.resumeUrl ? `- Résumé: ${absoluteUrl(base, profile.resumeUrl.startsWith("/") ? profile.resumeUrl : profile.resumeUrl)}` : ""}

## Optional

${mdLink(base, "/rss.xml", "RSS feed", "Latest blog posts")}
${mdLink(base, "/llms-full.txt", "llms-full.txt", "Extended machine-readable portfolio text")}
${mdLink(base, "/sitemap.xml", "Sitemap", "All indexable URLs")}
`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [site, profile, projects, posts, graph, milestones, world] = await Promise.all([
    getSiteConfig(),
    getProfile(),
    getProjects(),
    getAllPostMeta(),
    getSkillGraph(),
    getMilestones(),
    getWorldNarrative(),
  ]);

  const base = site.url;
  const lines: string[] = [
    `# ${site.name} — full portfolio context`,
    "",
    `> ${site.description}`,
    "",
    `Canonical site: ${base}`,
    `Preferred text entry point: ${absoluteUrl(base, "/read")}`,
    "",
    "## Profile",
    "",
    `- **Name:** ${profile.name}`,
    `- **Role:** ${profile.role}`,
    `- **Location:** ${profile.location}`,
    `- **Tagline:** ${profile.tagline}`,
    `- **Summary:** ${profile.summary}`,
    profile.availability ? `- **Availability:** ${profile.availability}` : "",
    `- **Email:** ${profile.email}`,
    "",
    "## Introduction",
    "",
    world.introProse.trim(),
    "",
    "## Career milestones",
    "",
    ...milestones.map((m) => `### ${m.period} — ${m.title}\n\n${m.description.trim()}\n`),
    "## Projects",
    "",
    ...projects.flatMap((p) => [
      `### ${p.title}`,
      "",
      `- URL: ${absoluteUrl(base, `/work/${p.slug}`)}`,
      `- Role: ${p.role}`,
      `- Year: ${p.year}`,
      `- Status: ${p.status}`,
      `- Tech: ${p.tech.join(", ")}`,
      `- Summary: ${p.summary}`,
      `- Problem: ${p.narrative.problem}`,
      `- Challenge: ${p.narrative.challenge}`,
      `- Process: ${p.narrative.process}`,
      `- Solution: ${p.narrative.solution}`,
      `- Outcome: ${p.narrative.outcome}`,
      "",
    ]),
    "## Skills",
    "",
    ...graph.nodes.map(
      (n) => `- **${n.label}** (${n.category}, ${n.level}/5)${n.summary ? `: ${n.summary}` : ""}`,
    ),
    "",
    "## Writing",
    "",
    ...posts.flatMap((p) => [
      `### ${p.title}`,
      "",
      `- URL: ${absoluteUrl(base, `/blog/${p.slug}`)}`,
      `- Category: ${p.category}`,
      `- Date: ${p.date}`,
      `- Tags: ${p.tags.join(", ") || "—"}`,
      `- Reading time: ${p.readingMinutes} min`,
      `- Description: ${p.description}`,
      "",
    ]),
    "## Story chapters",
    "",
    ...world.chapters.map((chapter) =>
      `- **${chapter.title}:** ${world.chapterGoals[chapter.id] ?? ""}`.trim(),
    ),
    "",
    "## Contact & links",
    "",
    `- Email: ${profile.email}`,
    ...profile.socials.map((s) => `- ${s.label}: ${s.href}`),
    profile.resumeUrl
      ? `- Résumé: ${absoluteUrl(base, profile.resumeUrl.startsWith("/") ? profile.resumeUrl : profile.resumeUrl)}`
      : "",
  ];

  return (
    lines
      .filter((line) => line !== undefined)
      .join("\n")
      .trimEnd() + "\n"
  );
}
