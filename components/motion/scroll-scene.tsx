"use client";

import { useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import * as React from "react";

type ScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>;
type ScrollOffset = ScrollOptions["offset"];

type ScrollSceneProps = {
  /** Render-prop receiving a 0..1 progress MotionValue for this scene. */
  children: (progress: MotionValue<number>) => React.ReactNode;
  className?: string;
  /** Scroll offset range; defaults to entry/exit through the viewport. */
  offset?: ScrollOffset;
};

/** A section wrapper that exposes its own scroll progress to children. */
export function ScrollScene({ children, className, offset }: ScrollSceneProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset ?? ["start end", "end start"],
  });

  return (
    <div ref={ref} className={className}>
      {children(scrollYProgress)}
    </div>
  );
}
