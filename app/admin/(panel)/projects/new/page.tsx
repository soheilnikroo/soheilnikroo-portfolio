import type { Metadata } from "next";

import { ProjectEditor } from "@/features/admin/components/project-editor";

export const metadata: Metadata = {
  title: "Admin — New project",
  robots: { index: false, follow: false },
};
export default function AdminNewProjectPage() {
  return <ProjectEditor mode="create" />;
}
