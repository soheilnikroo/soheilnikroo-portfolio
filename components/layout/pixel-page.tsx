import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PORTFOLIO_SHELL } from "@/lib/world/world-theme";

export function PixelPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(PORTFOLIO_SHELL, "min-h-screen", className)}>{children}</div>;
}
