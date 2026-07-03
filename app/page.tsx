import type { Metadata } from "next";

import { CrawlerNav } from "@/components/seo/crawler-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { WorldNarrative } from "@/features/world";
import { WorldExperienceIsland } from "@/features/world/components/world-experience-island";
import { WorldSplash } from "@/features/world/components/world-splash";
import { getProfile } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { ogImageEntries, pageTwitter } from "@/lib/seo/metadata-helpers";
import { worldAssetUrl } from "@/lib/world/asset-url";
import { getWorldPageProps } from "@/lib/world/get-world-props";

export const revalidate = 300;

const WORLD_PRELOADS = [
  worldAssetUrl("/world/scenes/intro-hero-dawn.png"),
  worldAssetUrl("/world/character/idle/east/0.png"),
  worldAssetUrl("/world/tilesets/intro/ground.png"),
] as const;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const description = site.pages.home.ogDescription;
  return {
    title: site.title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: site.title,
      description,
      url: site.url,
      images: ogImageEntries(site.url, "/opengraph-image"),
    },
    twitter: pageTwitter(site.title, description, site.twitterHandle),
  };
}
export default async function HomePage() {
  const [props, profile, site] = await Promise.all([
    getWorldPageProps(),
    getProfile(),
    getSiteConfig(),
  ]);
  const graphLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: profile.name,
        url: site.url,
        jobTitle: profile.role,
        email: profile.email,
        sameAs: profile.socials.filter((so) => so.platform !== "email").map((so) => so.href),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": `${site.url}/#person` },
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}/#webpage`,
        url: site.url,
        name: site.title,
        description: site.pages.home.ogDescription,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#person` },
        relatedLink: `${site.url}/read`,
      },
    ],
  };
  return (
    <>
      {WORLD_PRELOADS.map((href) => (
        <link key={href} rel="preload" href={href} as="image" fetchPriority="high" />
      ))}
      <link rel="preload" href="/3d-model/ROOM.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="alternate" type="text/html" href={`${site.url}/read`} title="Readable portfolio" />
      <JsonLd data={graphLd} />
      <CrawlerNav description={site.description} name={site.name} />
      <WorldSplash />
      <noscript>
        <style>{`#world-splash{display:none!important}#world-narrative{position:static!important;width:auto!important;height:auto!important;margin:0!important;overflow:visible!important;clip:auto!important;white-space:normal!important}`}</style>
      </noscript>
      <WorldNarrative {...props} variant="embedded" />
      <WorldExperienceIsland {...props} />
    </>
  );
}
