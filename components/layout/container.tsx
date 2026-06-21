import type * as React from "react";

import { cn } from "@/lib/utils";

/** Centered content column with consistent max-width + gutter padding. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[var(--content)] px-gutter", className)}>
      {children}
    </div>
  );
}
