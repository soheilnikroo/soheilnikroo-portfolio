import type { WorldExperienceProps } from "@/features/world/components/world-experience";
import { getAllPostMeta, getProfile, getProjects, getSkillGraph } from "@/lib/data";
import { milestones } from "@/lib/data/milestones";

/** Shared props for the game island and the readable `/read` page. */
export async function getWorldPageProps(): Promise<WorldExperienceProps> {
  const [profile, projects, graph, posts] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkillGraph(),
    getAllPostMeta(),
  ]);

  return {
    profileName: profile.name,
    role: profile.role,
    tagline: profile.tagline,
    summary: profile.summary,
    location: profile.location,
    milestones: milestones.map((m) => ({
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
      .filter((s) => s.platform !== "email")
      .map((s) => ({ label: s.label, href: s.href })),
  };
}
