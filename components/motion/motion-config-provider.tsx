"use client";

import { MotionConfig } from "motion/react";
import type * as React from "react";

/**
 * Wires Motion to honor the OS reduced-motion preference globally
 * (`reducedMotion="user"`), so transform-based animations degrade to opacity-only.
 */
export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
