import type { Metadata } from "next";

import { ProfileEditor } from "@/features/admin/components/profile-editor";
import { getProfile } from "@/lib/data/profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Profile",
  robots: { index: false, follow: false },
};
export default async function AdminProfilePage() {
  const profile = await getProfile();
  return <ProfileEditor initial={profile} />;
}
