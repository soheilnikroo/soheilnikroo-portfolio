import type { Metadata } from "next";

import { SkillsEditor } from "@/features/admin/components/skills-editor";
import { getSkillGraph } from "@/lib/data/skills";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Skills",
  robots: { index: false, follow: false },
};
export default async function AdminSkillsPage() {
  const skills = await getSkillGraph();
  return <SkillsEditor initial={skills} />;
}
