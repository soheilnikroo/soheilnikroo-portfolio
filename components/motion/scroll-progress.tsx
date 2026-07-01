"use client";
import { useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import * as React from "react";

const ScrollProgressContext = React.createContext<MotionValue<number> | null>(null);
export function ScrollProgressProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  return (
    <ScrollProgressContext.Provider value={scrollYProgress}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
