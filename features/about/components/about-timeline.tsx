"use client";

import { motion, useInView, useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import * as React from "react";

import { Container } from "@/components/layout/container";
import { Tilt } from "@/components/motion/tilt";
import { useAmbient } from "@/features/ambient";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

import type { Milestone } from "../about-content";

type Side = "left" | "right";

/** Build a smooth path that starts at top-center and weaves to each milestone's side. */
function buildCurvePath(sides: Side[]): string {
  const H = 1000;
  const xFor = (side: Side) => (side === "left" ? 22 : 78);
  let prevX = 50;
  let prevY = 0;
  let d = `M ${prevX} 0`;
  sides.forEach((side, index) => {
    const y = ((index + 0.5) / sides.length) * H;
    const x = xFor(side);
    const midY = prevY + (y - prevY) * 0.5;
    d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
    prevX = x;
    prevY = y;
  });
  const tailY = prevY + (H - prevY) * 0.5;
  d += ` C ${prevX} ${tailY}, 50 ${tailY}, 50 ${H}`;
  return d;
}

function AboutMilestone({
  milestone,
  side,
  reduced,
}: {
  milestone: Milestone;
  side: Side;
  reduced: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55, once: false });
  const { cue } = useAmbient();
  const dir = side === "right" ? 1 : -1;

  return (
    <div className="relative grid min-h-[56svh] items-center pl-10 sm:grid-cols-2 sm:pl-0">
      <motion.div
        ref={ref}
        initial={false}
        animate={
          reduced
            ? { opacity: 1, x: 0, scale: 1 }
            : { opacity: inView ? 1 : 0.3, x: inView ? 0 : dir * 56, scale: inView ? 1 : 0.95 }
        }
        transition={{ duration: durations.slow, ease: easing("emphasized") }}
        onPointerEnter={() => {
          if (inView) cue("hover");
        }}
        className={cn(
          "group",
          side === "right" ? "sm:col-start-2 sm:pl-12" : "sm:col-start-1 sm:pr-12",
        )}
      >
        <Tilt
          className={cn(
            "max-w-[var(--prose)]",
            side === "right" ? "sm:text-left" : "sm:text-right",
          )}
        >
          <div className="transition-transform duration-300 group-hover:-translate-y-1">
            <p
              className={cn(
                "inline-flex items-center gap-3 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase transition-colors group-hover:text-foreground",
                side === "left" && "sm:flex-row-reverse",
              )}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-foreground/40 transition-all duration-300 group-hover:scale-150 group-hover:bg-foreground"
              />
              {milestone.period}
            </p>
            <h3 className="mt-3 font-heading text-4xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              <span className="relative inline-block">
                {milestone.title}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 rounded bg-foreground/60 transition-transform duration-500 ease-[var(--ease-emphasized-value)] group-hover:scale-x-100",
                    side === "left" && "sm:origin-right",
                  )}
                />
              </span>
            </h3>
            <p className="mt-5 text-lg text-pretty text-muted-foreground sm:text-xl">
              {milestone.description}
            </p>
          </div>
        </Tilt>
      </motion.div>
    </div>
  );
}

function DesktopCurve({
  d,
  progress,
  reduced,
}: {
  d: string;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full text-foreground/25 sm:block"
    >
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{ pathLength: reduced ? 1 : progress }}
      />
    </svg>
  );
}

export function AboutScrolly({ items }: { items: Milestone[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const sides: Side[] = items.map((_, index) => (index % 2 === 0 ? "right" : "left"));
  const path = buildCurvePath(sides);

  if (reduced) {
    return (
      <Container>
        <ol className="space-y-20 py-section">
          {items.map((item) => (
            <li key={item.id}>
              <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {item.period}
              </p>
              <h3 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                {item.title}
              </h3>
              <p className="mt-4 max-w-[var(--prose)] text-lg text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    );
  }

  return (
    <div ref={ref} className="relative">
      <DesktopCurve d={path} progress={scrollYProgress} reduced={reduced} />
      {/* Mobile vertical draw line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-[18px] -z-10 h-full w-px bg-border sm:hidden"
      >
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="h-full w-px origin-top bg-foreground/40"
        />
      </div>

      <Container className="relative">
        {items.map((item, index) => (
          <AboutMilestone
            key={item.id}
            milestone={item}
            side={sides[index] ?? "right"}
            reduced={reduced}
          />
        ))}
      </Container>
    </div>
  );
}
