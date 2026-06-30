"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";

/**
 * Animates routed page content on navigation (entrance fade + lift), keyed on
 * pathname. Reduced-motion users get an instant swap. This is a reliable
 * stand-in for the View Transitions API, which isn't available in this React build.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.slow, ease: easing("emphasized") }}
    >
      {children}
    </motion.div>
  );
}
