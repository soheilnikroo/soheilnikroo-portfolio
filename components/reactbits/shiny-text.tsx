"use client";

// Adapted from React Bits (https://reactbits.dev) — "ShinyText".
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: "left" | "right";
  delay?: number;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = "",
  color = "var(--muted-foreground)",
  shineColor = "var(--foreground)",
  spread = 120,
  direction = "left",
  delay = 0,
}: ShinyTextProps) {
  const progress = useMotionValue(0);
  const elapsedRef = React.useRef(0);
  const lastTimeRef = React.useRef<number | null>(null);
  const sign = direction === "left" ? 1 : -1;
  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time) => {
    if (disabled) {
      lastTimeRef.current = null;
      return;
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;

    const cycleDuration = animationDuration + delayDuration;
    const cycleTime = elapsedRef.current % cycleDuration;
    if (cycleTime < animationDuration) {
      const p = (cycleTime / animationDuration) * 100;
      progress.set(sign === 1 ? p : 100 - p);
    } else {
      progress.set(sign === 1 ? 100 : 0);
    }
  });

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`);

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
    >
      {text}
    </motion.span>
  );
}
