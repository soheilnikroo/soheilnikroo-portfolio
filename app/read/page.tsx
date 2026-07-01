import type { Metadata } from "next";

import { WorldNarrative } from "@/features/world";
import { getSiteConfig } from "@/lib/data/site-settings";
import { getWorldPageProps } from "@/lib/world/get-world-props";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  const copy = site.pages.read;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: "/read" },
    openGraph: {
      title: `${copy.title} · ${site.name}`,
      description: copy.ogDescription,
      url: `${site.url}/read`,
    },
  };
}
export default async function ReadPage() {
  const props = await getWorldPageProps();
  return <WorldNarrative {...props} variant="standalone" />;
}
