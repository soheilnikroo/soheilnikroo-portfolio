"use client";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";

const WORLD_ROUTES = new Set(["/", "/read"]);
export function WorldThemeSync(): null {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const savedThemeRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    const root = document.documentElement;
    const isWorld = WORLD_ROUTES.has(pathname);
    if (isWorld) {
      if (savedThemeRef.current === undefined) {
        savedThemeRef.current = theme;
      }
      root.setAttribute("data-pixel-world", "true");
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.removeAttribute("data-pixel-world");
      root.style.colorScheme = "";
      if (savedThemeRef.current !== undefined) {
        const restore = savedThemeRef.current;
        savedThemeRef.current = undefined;
        if (restore && restore !== "dark") {
          setTheme(restore);
        }
      }
    }
  }, [pathname, theme, setTheme]);
  return null;
}
