"use client";
import { useTheme } from "next-themes";
import * as React from "react";

const THEME_COLORS = {
  light: "#f3f0fa",
  dark: "#0b0918",
} as const;

export function ThemeMetaSync(): null {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
    let tag = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "theme-color");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
