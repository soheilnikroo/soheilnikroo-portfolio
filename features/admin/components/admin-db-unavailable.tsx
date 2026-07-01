"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminDbUnavailable() {
  const router = useRouter();

  return (
    <output className="mt-6 block rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <p className="font-medium text-amber-100">Content could not be loaded</p>
      <p className="mt-1 text-muted-foreground">
        This is usually temporary. Wait a moment, then try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => router.refresh()}
      >
        Retry
      </Button>
    </output>
  );
}
