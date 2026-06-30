import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { AdminDashboard } from "@/features/admin";
import { isAdmin } from "@/lib/auth/session";
import { listAllPostRows } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  let rows: Awaited<ReturnType<typeof listAllPostRows>> = [];
  let dbError = false;
  try {
    rows = await listAllPostRows(true);
  } catch {
    dbError = true;
  }
  return (
    <Container className="py-section">
      <AdminDashboard initialPosts={rows.map(toAdminPost)} dbError={dbError} />
    </Container>
  );
}
