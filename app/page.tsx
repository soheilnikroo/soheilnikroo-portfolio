import type { Metadata } from "next";

import { WorldNarrative } from "@/features/world";
import { WorldExperienceIsland } from "@/features/world/components/world-experience-island";
import { site } from "@/lib/config/site";
import { getProfile } from "@/lib/data";
import { getWorldPageProps } from "@/lib/world/get-world-props";

/** Intro-critical sprites — fetched early while the island chunk downloads. */
const WORLD_PRELOADS = [
  "/world/scenes/intro-hero-dawn.png",
  "/world/character/idle/east/0.png",
  "/world/tilesets/intro/ground.png",
] as const;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: site.title,
    description:
      "A scroll-scrubbed, pixel-art interactive portfolio. Scroll forward to play, scroll back to rewind.",
    url: site.url,
  },
};

export default async function HomePage() {
  const [props, profile] = await Promise.all([getWorldPageProps(), getProfile()]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphLd) }}
      />
      {/* Instant dark cover so a refresh never flashes the readable article before
          the canvas mounts. The island hides it once the first frame is drawn. */}
      <div id="world-splash" aria-hidden="true" className="fixed inset-0 z-[150] bg-[#05040b]" />
      <noscript>
        <style>{`#world-splash{display:none!important}#world-narrative{display:block!important}`}</style>
      </noscript>
      {/* Layer A: crawlable fallback on `/` for no-JS / reduced-motion. Full text lives at `/read`. */}
      <WorldNarrative {...props} variant="embedded" />
      {/* Layer B: scroll-scrubbed interactive overlay for capable, motion-allowing clients. */}
      <WorldExperienceIsland {...props} />
    </>
  );
}
