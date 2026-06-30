import type { Metadata } from "next";

import { WorldEditor } from "@/features/admin/components/world-editor";
import { getWorldNarrative } from "@/lib/data/world-narrative";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — World",
  robots: { index: false, follow: false },
};

export default async function AdminWorldPage() {
  const world = await getWorldNarrative();
  return <WorldEditor initial={world} />;
}
