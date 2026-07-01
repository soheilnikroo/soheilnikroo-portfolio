"use client";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  extraScale?: number;
  className?: string;
  children?: React.ReactNode;
}
type Spark = {
  x: number;
  y: number;
  angle: number;
  startTime: number;
};
export function ClickSpark({
  sparkColor = "#a1a1aa",
  sparkSize = 9,
  sparkRadius = 16,
  sparkCount = 8,
  duration = 420,
  extraScale = 1,
  className,
  children,
}: ClickSparkProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sparks = React.useRef<Spark[]>([]);
  const reduced = useReducedMotion();
  const isExperience = usePathname() === "/";
  React.useEffect(() => {
    if (reduced || isExperience) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasEl = canvas;
    const context = ctx;
    const parent = canvasEl.parentElement;
    const resize = () => {
      const rect = (parent ?? canvasEl).getBoundingClientRect();
      canvasEl.width = rect.width;
      canvasEl.height = rect.height;
    };
    resize();
    const ro = parent ? new ResizeObserver(resize) : null;
    ro?.observe(parent ?? canvasEl);
    const ease = (t: number) => t * (2 - t);
    let raf = 0;
    const draw = (timestamp: number) => {
      context.clearRect(0, 0, canvasEl.width, canvasEl.height);
      sparks.current = sparks.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        const eased = ease(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        context.strokeStyle = sparkColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        return true;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onClick = (event: MouseEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparks.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now });
      }
    };
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("click", onClick);
    };
  }, [reduced, isExperience, sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);
  return (
    <div className={cn("relative w-full", className)}>
      {isExperience ? null : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[var(--z-toast)]"
        />
      )}
      {children}
    </div>
  );
}
