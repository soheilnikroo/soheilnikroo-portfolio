import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Writing",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return <AdminDashboard />;
}
