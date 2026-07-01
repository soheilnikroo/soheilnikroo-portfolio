"use client";

import * as React from "react";

import { AdminDbUnavailable } from "@/features/admin/components/admin-db-unavailable";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin] panel error:", error);
    } else {
      console.warn("[admin] panel error");
    }
  }, [error]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Admin</h1>
      <AdminDbUnavailable />
      <button
        type="button"
        onClick={reset}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
