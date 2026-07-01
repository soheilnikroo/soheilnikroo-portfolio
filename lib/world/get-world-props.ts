import { unstable_cache } from "next/cache";

import type { WorldExperienceProps } from "@/features/world/components/world-experience";
import { getAllPostMeta, getProfile, getProjects, getSkillGraph } from "@/lib/data";
import { getMilestones } from "@/lib/data/milestones";
import { CONTENT_CACHE_REVALIDATE_SECONDS, CONTENT_CACHE_TAG } from "@/lib/data/revalidate-content";
import { getWorldNarrative, trackHeightVh } from "@/lib/data/world-narrative";

async function fetchWorldPageProps(): Promise<WorldExperienceProps> {
  const [profile, projects, graph, posts, milestoneList, world] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkillGraph(),
    getAllPostMeta(),
    getMilestones(),
    getWorldNarrative(),
  ]);
  return {
    profileName: profile.name,
    role: profile.role,
    tagline: profile.tagline,
    summary: profile.summary,
    location: profile.location,
    milestones: milestoneList.map((m) => ({
      period: m.period,
      title: m.title,
      description: m.description,
    })),
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      role: p.role,
      year: String(p.year),
      summary: p.summary,
    })),
    skills: graph.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      category: n.category,
      level: n.level,
      summary: n.summary ?? "",
    })),
    posts: posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      category: p.category,
      minutes: Math.round(p.readingMinutes),
    })),
    email: profile.email,
    resumeUrl: profile.resumeUrl,
    socials: profile.socials
      .filter((s) => s.platform !== "email" && s.platform !== "x")
      .map((s) => ({ label: s.label, href: s.href })),
    introProse: world.introProse,
    chapterMeta: world.chapters,
    chapterGoals: world.chapterGoals,
    storyBeats: world.storyBeats,
    trackHeightVh: trackHeightVh(world.chapters),
  };
}

const getWorldPagePropsCached = unstable_cache(fetchWorldPageProps, ["world-page-props"], {
  tags: [CONTENT_CACHE_TAG],
  revalidate: CONTENT_CACHE_REVALIDATE_SECONDS,
});

export async function getWorldPageProps(): Promise<WorldExperienceProps> {
  if (process.env.NODE_ENV === "test") return fetchWorldPageProps();
  return getWorldPagePropsCached();
}
