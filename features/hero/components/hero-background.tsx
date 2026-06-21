"use client";

import { useInView } from "motion/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Lazy-load the WebGL aurora (pulls in `ogl`) only when actually rendered.
const Aurora = dynamic(() => import("@/components/reactbits/aurora").then((m) => m.Aurora), {
  ssr: false,
});

const STOPS_DARK = ["#5227FF", "#22d3ee", "#7c3aed"];
const STOPS_LIGHT = ["#6366f1", "#06b6d4", "#a855f7"];

/**
 * Flowing aurora hero backdrop (React Bits). Mounts only when the hero is in view
 * and never under reduced motion; colors adapt to the theme.
 */
export function HeroBackground({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const inView = useInView(targetRef, { amount: 0 });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (reduced || !mounted || !inView) return null;

  const dark = resolvedTheme !== "light";

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-20">
      <Aurora
        colorStops={dark ? STOPS_DARK : STOPS_LIGHT}
        amplitude={1.15}
        blend={0.55}
        speed={0.8}
        className="h-full w-full"
      />
    </div>
  );
}
