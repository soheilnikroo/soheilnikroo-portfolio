"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { usePathname } from "next/navigation";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Subtle, always-on cinematic atmosphere: theme-aware gradient wash + faint grain,
 * with a gentle scroll-linked drift. Pure CSS (no images) to protect LCP, and
 * static under reduced motion. Decorative only (aria-hidden, non-interactive).
 */
export function AmbientBackground() {
  const reduced = useReducedMotion();
  const isExperience = usePathname() === "/";
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // The experience paints its own full-screen world; this decorative layer would
  // just be a hidden, always-on scroll subscription underneath it.
  if (isExperience) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={reduced ? undefined : { y }}
        className="ambient-gradient absolute -inset-[10%]"
      />
      <div className="ambient-grain absolute inset-0" />
    </div>
  );
}
