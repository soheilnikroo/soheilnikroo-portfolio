"use client";

import { motion, useScroll, useTransform } from "motion/react";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /** Parallax intensity; higher = more travel. Disabled under reduced motion. */
  speed?: number;
};

/** Translates children on the Y axis as they pass through the viewport. */
export function Parallax({ children, className, speed = 0.2 }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = 100 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel]);

  return (
    <motion.div ref={ref} style={reduced ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}
