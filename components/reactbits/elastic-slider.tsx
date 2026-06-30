"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * React Bits — ElasticSlider.
 * A draggable slider whose track stretches elastically when dragged past its
 * bounds, then springs back. Reports its value (startingValue..maxValue) via onChange.
 */
const MAX_OVERFLOW = 50;

function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export type ElasticSliderProps = {
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  isStepped?: boolean;
  stepSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (value: number) => void;
  className?: string;
};

export function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  isStepped = false,
  stepSize = 1,
  leftIcon,
  rightIcon,
  onChange,
  className,
}: ElasticSliderProps) {
  const [value, setValue] = React.useState(defaultValue);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [region, setRegion] = React.useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useMotionValueEvent(clientX, "change", (latest) => {
    const el = sliderRef.current;
    if (!el) return;
    const { left, right } = el.getBoundingClientRect();
    let val = 0;
    if (latest < left) {
      setRegion("left");
      val = left - latest;
    } else if (latest > right) {
      setRegion("right");
      val = latest - right;
    } else {
      setRegion("middle");
      val = 0;
    }
    overflow.jump(decay(val, MAX_OVERFLOW));
  });

  const commit = (clientXPos: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    let next = startingValue + ((clientXPos - left) / width) * (maxValue - startingValue);
    if (isStepped) next = Math.round(next / stepSize) * stepSize;
    next = Math.min(Math.max(next, startingValue), maxValue);
    setValue(next);
    onChange?.(next);
    clientX.jump(clientXPos);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) commit(e.clientX);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    commit(e.clientX);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const trackScaleX = useTransform(overflow, (latest) => {
    const el = sliderRef.current;
    if (!el) return 1;
    const { width } = el.getBoundingClientRect();
    return width > 0 ? 1 + latest / width : 1;
  });
  const trackScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.7]);

  const total = maxValue - startingValue;
  const rangePct = total === 0 ? 0 : ((value - startingValue) / total) * 100;
  const transformOrigin = region === "left" ? "right" : region === "right" ? "left" : "center";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {leftIcon ? <span className="shrink-0 text-white/55">{leftIcon}</span> : null}
      <motion.div
        onHoverStart={() => animate(scale, 1.06)}
        onHoverEnd={() => animate(scale, 1)}
        style={{ scale }}
        className="flex w-full touch-none items-center select-none"
      >
        <motion.div
          ref={sliderRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ scaleX: trackScaleX, scaleY: trackScaleY, transformOrigin }}
          className="relative flex h-4 grow cursor-grab items-center active:cursor-grabbing"
        >
          <div className="h-1.5 w-full rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#818cf8]" style={{ width: `${rangePct}%` }} />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(129,140,248,0.8)]"
            style={{ left: `${rangePct}%` }}
          />
        </motion.div>
      </motion.div>
      {rightIcon ? <span className="shrink-0 text-white/55">{rightIcon}</span> : null}
    </div>
  );
}
