import type { Metadata } from "next";

import { WorldNarrative } from "@/features/world";
import { WorldExperienceIsland } from "@/features/world/components/world-experience-island";
import { getProfile } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { getWorldPageProps } from "@/lib/world/get-world-props";

/** Intro-critical sprites — fetched early while the island chunk downloads. */
const WORLD_PRELOADS = [
  "/world/scenes/intro-hero-dawn.png",
  "/world/character/idle/east/0.png",
  "/world/tilesets/intro/ground.png",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    alternates: { canonical: "/" },
    openGraph: {
      title: site.title,
      description: site.pages.home.ogDescription,
      url: site.url,
    },
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
        description: site.description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#person` },
      },
    ],
  };

  return (
    <>
      {WORLD_PRELOADS.map((href) => (
        <link key={href} rel="preload" href={href} as="image" fetchPriority="high" />
      ))}
      <link rel="preload" href="/3d-model/ROOM.glb" as="fetch" crossOrigin="anonymous" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphLd) }}
      />
      <div id="world-splash" aria-hidden="true" className="fixed inset-0 z-[150] bg-[#05040b]" />
      <noscript>
        <style>{`#world-splash{display:none!important}#world-narrative{display:block!important}`}</style>
      </noscript>
      <WorldNarrative {...props} variant="embedded" />
      <WorldExperienceIsland {...props} />
    </>
  );
}
