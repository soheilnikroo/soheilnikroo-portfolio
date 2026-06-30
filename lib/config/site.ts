import { fallbackSiteSettings, getSiteUrl } from "@/lib/data/site-settings";

/** Static fallback for legacy imports. Prefer `getSiteConfig()` in Server Components. */
export const site = {
  name: fallbackSiteSettings.name,
  title: fallbackSiteSettings.title,
  description: fallbackSiteSettings.description,
  url: getSiteUrl(),
  locale: fallbackSiteSettings.locale,
} as const;

export {
  fallbackSiteSettings,
  getSiteConfig,
  getSiteSettings,
  getSiteUrl,
  saveSiteSettings,
} from "@/lib/data/site-settings";
