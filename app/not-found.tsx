import type { Metadata } from "next";
import Link from "next/link";

import { getSiteConfig } from "@/lib/data/site-settings";
import {
  PIXEL_CARD,
  PIXEL_FONT,
  PIXEL_GHOST_BTN,
  PIXEL_HEADING_SHADOW,
  PIXEL_PRIMARY_BTN,
  WORLD_SHELL,
} from "@/lib/world/world-theme";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: site.pages.notFound.title,
    robots: { index: false, follow: false },
  };
}
export default async function NotFound() {
  const site = await getSiteConfig();
  const copy = site.pages.notFound;
  return (
    <section
      className={`flex min-h-[82vh] items-center justify-center px-6 text-center ${WORLD_SHELL}`}
    >
      <div
        className={`w-full max-w-lg border-4 border-pixel-border/35 p-8 ${PIXEL_CARD} ${PIXEL_FONT}`}
      >
        <p className="text-xs tracking-[0.3em] text-amber-700/80 uppercase dark:text-amber-300/80">
          Game over
        </p>
        <p className={`mt-3 text-7xl font-black sm:text-8xl ${PIXEL_HEADING_SHADOW}`}>404</p>
        <h1 className="mt-3 text-xl font-bold">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm text-pixel-fg-muted">{copy.message}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={PIXEL_PRIMARY_BTN}>
            {copy.homeLink}
          </Link>
          <Link href="/blog" className={PIXEL_GHOST_BTN}>
            Read the log
          </Link>
        </div>
      </div>
    </section>
  );
}
