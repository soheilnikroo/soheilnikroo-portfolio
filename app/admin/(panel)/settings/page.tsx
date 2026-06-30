import type { Metadata } from "next";

import { SettingsEditor } from "@/features/admin/components/settings-editor";
import { getSiteSettings } from "@/lib/data/site-settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Site & SEO",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsEditor initial={settings} />;
}
