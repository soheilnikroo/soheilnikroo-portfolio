"use client";

import { useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import * as React from "react";

const ScrollProgressContext = React.createContext<MotionValue<number> | null>(null);

/** Provides a 0..1 MotionValue of overall document scroll progress to chapters. */
export function ScrollProgressProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  return (
    <ScrollProgressContext.Provider value={scrollYProgress}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

/** Read the global scroll-progress MotionValue (null outside the provider). */
export function useScrollProgress(): MotionValue<number> | null {
  return React.useContext(ScrollProgressContext);
}
