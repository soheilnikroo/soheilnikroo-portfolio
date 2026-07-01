import type { Metadata } from "next";

import { WorldNarrative } from "@/features/world";
import { getSiteConfig } from "@/lib/data/site-settings";
import { ogImageEntries, pageTwitter } from "@/lib/seo/metadata-helpers";
import { getWorldPageProps } from "@/lib/world/get-world-props";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const copy = site.pages.read;
  const title = `${copy.title} · ${site.name}`;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: "/read" },
    openGraph: {
      title,
      description: copy.ogDescription,
      url: `${site.url}/read`,
      images: ogImageEntries(site.url, "/opengraph-image"),
    },
    twitter: pageTwitter(title, copy.ogDescription, site.twitterHandle),
  };
}
export default async function ReadPage() {
  const [props, site] = await Promise.all([getWorldPageProps(), getSiteConfig()]);
  const copy = site.pages.read;
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: copy.title,
    description: copy.description,
    url: `${site.url}/read`,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <WorldNarrative {...props} variant="standalone" />
    </>
  );
}
