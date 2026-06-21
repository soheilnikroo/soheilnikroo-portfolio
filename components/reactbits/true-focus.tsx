"use client";

// Adapted from React Bits (https://reactbits.dev) — "TrueFocus". Named export, TS.
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  wordClassName?: string;
  className?: string;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function TrueFocus({
  sentence = "True Focus",
  separator = " ",
  manualMode = false,
  blurAmount = 5,
  borderColor = "#e6c463",
  glowColor = "rgba(230,196,99,0.6)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  wordClassName,
  className,
}: TrueFocusProps) {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lastActiveIndex, setLastActiveIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const wordRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = React.useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

  React.useEffect(() => {
    if (manualMode) return;
    const id = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000,
    );
    return () => clearInterval(id);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  React.useEffect(() => {
    const el = wordRefs.current[currentIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const parent = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setFocusRect({
      x: rect.left - parent.left,
      y: rect.top - parent.top,
      width: rect.width,
      height: rect.height,
    });
  }, [currentIndex, words.length]);

  const corner =
    "absolute h-4 w-4 rounded-[3px] border-[3px] [border-color:var(--border-color)] [filter:drop-shadow(0_0_4px_var(--border-color))]";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-wrap items-center justify-center gap-4 select-none",
        className,
      )}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            className={cn("relative font-black", wordClassName ?? "text-[3rem]")}
            style={{
              filter: isActive ? "blur(0px)" : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
            }}
            onMouseEnter={() => {
              if (manualMode) {
                setLastActiveIndex(index);
                setCurrentIndex(index);
              }
            }}
            onMouseLeave={() => {
              if (manualMode && lastActiveIndex !== null) setCurrentIndex(lastActiveIndex);
            }}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 box-border border-0"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: 1,
        }}
        transition={{ duration: animationDuration }}
        style={{ "--border-color": borderColor, "--glow-color": glowColor } as CSSProperties}
      >
        <span className={cn(corner, "top-[-10px] left-[-10px] border-r-0 border-b-0")} />
        <span className={cn(corner, "top-[-10px] right-[-10px] border-b-0 border-l-0")} />
        <span className={cn(corner, "bottom-[-10px] left-[-10px] border-t-0 border-r-0")} />
        <span className={cn(corner, "right-[-10px] bottom-[-10px] border-t-0 border-l-0")} />
      </motion.div>
    </div>
  );
}
