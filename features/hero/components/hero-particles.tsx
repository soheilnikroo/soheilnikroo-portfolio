"use client";

import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bvx: number;
  bvy: number;
  r: number;
};
type Ripple = { x: number; y: number; r: number; alpha: number };

const LINK = 120;
const REPEL_RADIUS = 130;

/**
 * Cursor-reactive particle field for the hero (canvas). Particles drift, link into
 * constellations near each other and the cursor, repel from the pointer, and react
 * to clicks with an impulse + ripple. DPR-aware, tab-paused, disabled under reduced
 * motion. Decorative; inherits color from `currentColor`.
 */
export function HeroParticles({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasEl = canvas;
    const context = ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let ripples: Ripple[] = [];
    let raf = 0;
    const mouse = { x: 0, y: 0, active: false };
    const color = getComputedStyle(canvasEl).color;

    function seed() {
      const count = Math.min(70, Math.max(22, Math.round((width * height) / 22000)));
      particles = Array.from({ length: count }, () => {
        const bvx = (Math.random() - 0.5) * 0.16;
        const bvy = (Math.random() - 0.5) * 0.16;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: bvx,
          vy: bvy,
          bvx,
          bvy,
          r: Math.random() * 1.6 + 0.5,
        };
      });
    }

    function resize() {
      width = canvasEl.clientWidth;
      height = canvasEl.clientHeight;
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function frame() {
      context.clearRect(0, 0, width, height);

      for (const p of particles) {
        // ease velocity back to base drift (lets click impulses decay)
        p.vx += (p.bvx - p.vx) * 0.04;
        p.vy += (p.bvy - p.vy) * 0.04;

        let pushX = 0;
        let pushY = 0;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = (1 - dist / REPEL_RADIUS) * 2.4;
            pushX = (dx / dist) * force;
            pushY = (dy / dist) * force;
          }
        }

        p.x = (p.x + p.vx + pushX + width) % width;
        p.y = (p.y + p.vy + pushY + height) % height;
      }

      // links between nearby particles
      context.strokeStyle = color;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            context.globalAlpha = (1 - dist / LINK) * 0.18;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      // links from cursor
      if (mouse.active) {
        for (const p of particles) {
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < LINK * 1.5) {
            context.globalAlpha = (1 - dist / (LINK * 1.5)) * 0.4;
            context.beginPath();
            context.moveTo(mouse.x, mouse.y);
            context.lineTo(p.x, p.y);
            context.stroke();
          }
        }
      }

      // particles
      context.fillStyle = color;
      for (const p of particles) {
        context.globalAlpha = 0.45;
        context.beginPath();
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      }

      // click ripples
      ripples = ripples.filter((rp) => rp.alpha > 0.02);
      for (const rp of ripples) {
        rp.r += 3.2;
        rp.alpha *= 0.95;
        context.globalAlpha = rp.alpha;
        context.beginPath();
        context.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        context.stroke();
      }

      context.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function toLocal(event: PointerEvent): { x: number; y: number; inside: boolean } {
      const rect = canvasEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    }

    function onPointerMove(event: PointerEvent) {
      const { x, y, inside } = toLocal(event);
      mouse.x = x;
      mouse.y = y;
      mouse.active = inside;
    }
    function onPointerDown(event: PointerEvent) {
      const { x, y, inside } = toLocal(event);
      if (!inside) return;
      ripples.push({ x, y, r: 0, alpha: 0.5 });
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < REPEL_RADIUS * 1.6) {
          const impulse = (1 - dist / (REPEL_RADIUS * 1.6)) * 6;
          p.vx += (dx / dist) * impulse;
          p.vy += (dy / dist) * impulse;
        }
      }
    }

    function start() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
