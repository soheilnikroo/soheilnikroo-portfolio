import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { WORLD_SHELL } from "@/lib/world/world-theme";

/** Shared dark pixel-art page shell for /work, /blog, etc. */
export function PixelPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(WORLD_SHELL, "min-h-screen", className)}>{children}</div>;
}
