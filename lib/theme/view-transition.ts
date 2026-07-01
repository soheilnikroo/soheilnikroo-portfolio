import { flushSync } from "react-dom";

export type ThemeTransitionOrigin = {
  x: number;
  y: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export function runThemeTransition(update: () => void, origin: ThemeTransitionOrigin): void {
  const root = document.documentElement;
  const { innerWidth, innerHeight } = window;
  const radius = Math.hypot(
    Math.max(origin.x, innerWidth - origin.x),
    Math.max(origin.y, innerHeight - origin.y),
  );

  root.style.setProperty("--theme-transition-x", `${origin.x}px`);
  root.style.setProperty("--theme-transition-y", `${origin.y}px`);
  root.style.setProperty("--theme-transition-radius", `${radius}px`);

  if (prefersReducedMotion() || !supportsViewTransitions()) {
    update();
    return;
  }

  document.startViewTransition(() => {
    flushSync(update);
  });
}
