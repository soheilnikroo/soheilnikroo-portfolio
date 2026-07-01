import type { Metadata } from "next";
import Image from "next/image";

import { WorldNarrative } from "@/features/world";
import { WorldExperienceIsland } from "@/features/world/components/world-experience-island";
import { getProfile } from "@/lib/data";
import { getSiteConfig } from "@/lib/data/site-settings";
import { worldAssetUrl } from "@/lib/world/asset-url";
import { getWorldPageProps } from "@/lib/world/get-world-props";

/** Intro-critical sprites — fetched early while the island chunk downloads. */
const WORLD_PRELOADS = [
  worldAssetUrl("/world/scenes/intro-hero-dawn.png"),
  worldAssetUrl("/world/character/idle/east/0.png"),
  worldAssetUrl("/world/tilesets/intro/ground.png"),
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
      <div
        id="world-splash"
        aria-hidden="true"
        className="fixed inset-0 z-[150] overflow-hidden bg-[#05040b]"
      >
        {/* Splash paints before the client island hydrates */}
        <Image
          src={WORLD_PRELOADS[0]}
          alt=""
          fill
          priority
          className="object-cover object-bottom opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1038]/75 via-[#05040b]/45 to-[#05040b]" />
      </div>
      <noscript>
        <style>{`#world-splash{display:none!important}#world-narrative{display:block!important}`}</style>
      </noscript>
      <WorldNarrative {...props} variant="embedded" />
      <WorldExperienceIsland {...props} />
    </>
  );
}
