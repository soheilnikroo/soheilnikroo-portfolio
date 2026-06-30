import type { Metadata } from "next";

import { MilestonesEditor } from "@/features/admin/components/milestones-editor";
import { getMilestones } from "@/lib/data/milestones";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Story",
  robots: { index: false, follow: false },
};

export default async function AdminStoryPage() {
  const milestones = await getMilestones();
  return <MilestonesEditor initial={milestones} />;
}
