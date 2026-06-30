import type { Metadata } from "next";

import { WorldNarrative } from "@/features/world";
import { site } from "@/lib/config/site";
import { getWorldPageProps } from "@/lib/world/get-world-props";

export const metadata: Metadata = {
  title: "Read as a page",
  description: "The readable, text version of Soheil Nikroo's portfolio story.",
  alternates: { canonical: "/read" },
  openGraph: {
    title: `Read as a page · ${site.name}`,
    description: "Projects, skills, writing, and contact — without the scroll game.",
    url: `${site.url}/read`,
  },
};

export default async function ReadPage() {
  const props = await getWorldPageProps();
  return <WorldNarrative {...props} variant="standalone" />;
}
