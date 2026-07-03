import type { MetadataRoute } from "next";

import { getAllPostMeta, getProjects } from "@/lib/data";
import { getSiteUrl } from "@/lib/data/site-settings";

export const revalidate = 300;

function latestDate(dates: readonly string[]): Date {
  if (dates.length === 0) return new Date();
  return new Date(
    `${dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]!)}T00:00:00Z`,
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([
    getAllPostMeta().catch(() => []),
    getProjects().catch(() => []),
  ]);
  const siteUrl = getSiteUrl();
  const blogLastMod = latestDate(posts.map((post) => post.updated ?? post.date));
  const workLastMod = latestDate(projects.map((project) => `${project.year}-12-31`));
  return [
    { url: siteUrl, lastModified: blogLastMod, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/read`,
      lastModified: blogLastMod,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/work`,
      lastModified: workLastMod,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${siteUrl}/blog`, lastModified: blogLastMod, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: new Date(`${p.year}-12-31T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(`${p.updated ?? p.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
