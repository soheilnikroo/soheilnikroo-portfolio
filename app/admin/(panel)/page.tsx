import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin";
import { listAllPostRows } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Writing",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  let rows: Awaited<ReturnType<typeof listAllPostRows>> = [];
  let dbError = false;
  try {
    rows = await listAllPostRows(true);
  } catch {
    dbError = true;
  }
  return <AdminDashboard initialPosts={rows.map(toAdminPost)} dbError={dbError} />;
}
