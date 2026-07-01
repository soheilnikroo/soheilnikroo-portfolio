"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { runThemeTransition } from "@/lib/theme/view-transition";
import { cn } from "@/lib/utils";

type ThemeChoice = "system" | "light" | "dark";
const ORDER: readonly ThemeChoice[] = ["system", "light", "dark"];
const META: Record<
  ThemeChoice,
  {
    label: string;
    Icon: LucideIcon;
  }
> = {
  system: { label: "System", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
};
function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const current: ThemeChoice = mounted && isThemeChoice(theme) ? theme : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
  const { Icon, label } = META[current];
  return (
    <button
      type="button"
      className={cn(className)}
      aria-label={`Theme: ${label}. Activate to switch to ${META[next].label.toLowerCase()}.`}
      title={`Theme: ${label}`}
      onClick={(event) => {
        runThemeTransition(() => setTheme(next), {
          x: event.clientX,
          y: event.clientY,
        });
      }}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
