"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const INTERACTIVE = "a,button,[role='button'],input,textarea,select,label,[data-cursor='hover']";

/**
 * Custom cursor: a precise dot plus a spring-lagged ring that grows over
 * interactive elements. Disabled on `/` (the game uses the native cursor).
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const isExperience = usePathname() === "/";
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 280, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 280, damping: 28, mass: 0.5 });

  React.useEffect(() => {
    const disable = (): void => {
      setEnabled(false);
      setVisible(false);
      setHovering(false);
      x.set(-100);
      y.set(-100);
      document.documentElement.classList.remove("cursor-none");
    };

    if (reduced || isExperience) {
      disable();
      return;
    }
    if (!window.matchMedia("(pointer: fine)").matches) {
      disable();
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add("cursor-none");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target;
      setHovering(target instanceof Element && Boolean(target.closest(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      disable();
    };
  }, [reduced, isExperience, x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-tooltip)] mix-blend-difference"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div style={{ x, y }} className="absolute -mt-1 -ml-1 size-2 rounded-full bg-white" />
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hovering ? 1.8 : 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="absolute -mt-4 -ml-4 size-8 rounded-full border border-white"
      />
    </div>
  );
}
