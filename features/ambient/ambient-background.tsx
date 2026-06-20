"use client";

import { motion, useScroll, useTransform } from "motion/react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Subtle, always-on cinematic atmosphere: theme-aware gradient wash + faint grain,
 * with a gentle scroll-linked drift. Pure CSS (no images) to protect LCP, and
 * static under reduced motion. Decorative only (aria-hidden, non-interactive).
 */
export function AmbientBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

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
