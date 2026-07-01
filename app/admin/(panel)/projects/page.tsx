import type { Metadata } from "next";

import { ProjectsDashboard } from "@/features/admin/components/projects-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false, follow: false },
};
export default function AdminProjectsPage() {
  return <ProjectsDashboard />;
}
