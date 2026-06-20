"use client";

import { motion, useInView } from "motion/react";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds of delay before revealing. */
  delay?: number;
  /** Initial vertical offset in pixels (ignored under reduced motion). */
  y?: number;
  /** Fraction of the element visible before triggering (0..1). */
  amount?: number;
  /** Reveal only once. */
  once?: boolean;
};

/** Reveals its children when scrolled into view. Opacity-only under reduced motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  amount = 0.3,
  once = true,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y }}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: inView ? 1 : 0, y: inView ? 0 : y }}
      transition={{ duration: durations.base, ease: easing("standard"), delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
