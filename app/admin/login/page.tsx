import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/features/admin";
import { safeAdminRedirectPath } from "@/lib/auth/paths";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin sign in",
};
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  if (await isAdmin()) redirect(safeAdminRedirectPath(params.next ?? null));
  return (
    <Container className="py-section">
      <Suspense fallback={<p className="mt-24 text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
