import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/data/site-settings";

const DISALLOW = ["/admin/", "/admin", "/api/"];

/** Major AI crawlers — explicitly allowed on public routes (admin/API remain blocked). */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "cohere-ai",
  "FacebookBot",
  "meta-externalagent",
] as const;

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/" as const,
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
