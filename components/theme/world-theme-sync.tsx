"use client";
import { usePathname } from "next/navigation";
import * as React from "react";

/** Game canvas only — reading routes use the normal theme toggle. */
const WORLD_ROUTES = new Set(["/"]);

export function WorldThemeSync(): null {
  const pathname = usePathname();

  React.useEffect(() => {
    const root = document.documentElement;
    if (WORLD_ROUTES.has(pathname)) {
      root.setAttribute("data-pixel-world", "true");
      root.style.colorScheme = "dark";
      return;
    }
    root.removeAttribute("data-pixel-world");
    root.style.colorScheme = "";
  }, [pathname]);

  return null;
}
