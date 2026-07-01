import { unstable_cache } from "next/cache";

import { logContentStoreError } from "@/lib/db/log-content-store";
import { getSiteContentRow, upsertSiteContentRow } from "@/lib/db/site-content-store";
import { SiteSettingsSchema } from "@/lib/schemas";
import type { SiteSettings } from "@/lib/schemas";

import { CONTENT_CACHE_TAG } from "./revalidate-content";

export const fallbackSiteSettings: SiteSettings = SiteSettingsSchema.parse({
  name: "Soheil Nikroo",
  title: "Soheil Nikroo — Software Engineer",
  description:
    "Software engineer focused on immersive, accessible web experiences — motion, performance, and front-end architecture.",
  keywords: [
    "Soheil Nikroo",
    "front-end engineer",
    "frontend developer",
    "interactive portfolio",
    "pixel art portfolio",
    "Next.js",
    "TypeScript",
    "React",
    "web animation",
    "Tehran",
  ],
  twitterHandle: "@soheilnikroo",
  locale: "en_US",
  nav: [
    { href: "/", label: "Play" },
    { href: "/read", label: "Read" },
    { href: "/work", label: "Projects" },
    { href: "/blog", label: "Writing" },
  ],
  headerBrand: "▶ SOHEIL NIKROO",
  skipToContent: "Skip to content",
  footerTagline: "insert coin",
  pages: {
    home: {
      ogDescription:
        "A scroll-scrubbed, pixel-art interactive portfolio. Scroll forward to play, scroll back to rewind.",
    },
    work: {
      title: "Projects",
      description:
        "Selected projects — platforms, design systems, and tools, each with the story and screenshots behind it.",
      eyebrow: "▶ Select a level",
      subtitle:
        "Platforms, design systems, and tools — each with the problem it solved, how it was built, and screenshots.",
      backLink: "← Back to the world",
      enterLabel: "Enter →",
      latestWriting: "Latest writing",
      allWriting: "All writing →",
    },
    blog: {
      title: "Writing",
      description: "Notes on motion, front-end architecture, and building for the web.",
      eyebrow: "▶ Field notes",
      subtitle: "Architecture, motion, and craft — written as I learn.",
    },
    read: {
      title: "Read as a page",
      description: "The readable, text version of Soheil Nikroo's portfolio story.",
      ogDescription: "Projects, skills, writing, and contact — without the scroll game.",
    },
    notFound: {
      title: "Page not found",
      message: "That route isn't on the map. Try the homepage or read view.",
      homeLink: "Back home",
    },
  },
});
async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await getSiteContentRow("site");
    if (!row) return fallbackSiteSettings;
    return SiteSettingsSchema.parse(row.data);
  } catch (error) {
    logContentStoreError("site", error);
    return fallbackSiteSettings;
  }
}
const getSiteSettingsCached = unstable_cache(readSiteSettings, ["site-settings"], {
  tags: [CONTENT_CACHE_TAG],
  revalidate: 60,
});
export async function getSiteSettings(): Promise<SiteSettings> {
  if (process.env.NODE_ENV === "test") return readSiteSettings();
  return getSiteSettingsCached();
}
export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  const parsed = SiteSettingsSchema.parse(data);
  await upsertSiteContentRow("site", parsed);
}
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://soheilnikroo.dev";
}
export async function getSiteConfig() {
  const settings = await getSiteSettings();
  return { ...settings, url: getSiteUrl() };
}
