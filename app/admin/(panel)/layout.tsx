import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { isAdmin } from "@/lib/auth/session";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Container className="py-section">
      <AdminShell>{children}</AdminShell>
    </Container>
  );
}
