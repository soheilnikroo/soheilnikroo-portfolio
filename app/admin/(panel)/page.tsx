import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin";
import { listAllPostRows } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";
import { logContentStoreError } from "@/lib/db/log-content-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Writing",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  try {
    const rows = await listAllPostRows(true);
    return <AdminDashboard initialPosts={rows.map(toAdminPost)} />;
  } catch (error) {
    logContentStoreError("blog", error);
    return <AdminDashboard initialPosts={[]} dbUnavailable />;
  }
}
