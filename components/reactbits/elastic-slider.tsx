"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

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
  ariaLabel?: string;
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
  ariaLabel = "Volume",
}: ElasticSliderProps) {
  const [value, setValue] = React.useState(defaultValue);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [region, setRegion] = React.useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useMotionValueEvent(clientX, "change", (latest) => {
    const el = trackRef.current;
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

  const commit = React.useCallback(
    (clientXPos: number) => {
      const el = trackRef.current;
      if (!el) return;
      const { left, width } = el.getBoundingClientRect();
      let next = startingValue + ((clientXPos - left) / width) * (maxValue - startingValue);
      if (isStepped) next = Math.round(next / stepSize) * stepSize;
      next = Math.min(Math.max(next, startingValue), maxValue);
      setValue(next);
      onChange?.(next);
      clientX.jump(clientXPos);
    },
    [clientX, isStepped, maxValue, onChange, startingValue, stepSize],
  );

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setValue(next);
    onChange?.(next);
    const el = trackRef.current;
    if (el) {
      const { left, width } = el.getBoundingClientRect();
      const ratio = (next - startingValue) / (maxValue - startingValue);
      clientX.jump(left + ratio * width);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLInputElement>) => {
    if (event.buttons > 0) commit(event.clientX);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    commit(event.clientX);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const trackScaleX = useTransform(overflow, (latest) => {
    const el = trackRef.current;
    if (!el) return 1;
    const { width } = el.getBoundingClientRect();
    return width > 0 ? 1 + latest / width : 1;
  });
  const trackScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.7]);
  const total = maxValue - startingValue;
  const rangePct = total === 0 ? 0 : ((value - startingValue) / total) * 100;
  const transformOrigin = region === "left" ? "right" : region === "right" ? "left" : "center";
  const step = isStepped ? stepSize : "any";

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
          ref={trackRef}
          style={{ scaleX: trackScaleX, scaleY: trackScaleY, transformOrigin }}
          className="relative flex h-4 grow items-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15"
          >
            <div className="h-full rounded-full bg-[#818cf8]" style={{ width: `${rangePct}%` }} />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(129,140,248,0.8)]"
            style={{ left: `${rangePct}%` }}
          />
          <input
            type="range"
            min={startingValue}
            max={maxValue}
            step={step}
            value={value}
            aria-label={ariaLabel}
            onChange={handleInput}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative z-10 h-4 w-full cursor-grab appearance-none bg-transparent focus-visible:outline-none active:cursor-grabbing [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent"
          />
        </motion.div>
      </motion.div>
      {rightIcon ? <span className="shrink-0 text-white/55">{rightIcon}</span> : null}
    </div>
  );
}
