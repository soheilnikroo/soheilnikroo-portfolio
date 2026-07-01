import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/features/admin";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};
export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <Container className="py-section">
      <LoginForm />
    </Container>
  );
}
