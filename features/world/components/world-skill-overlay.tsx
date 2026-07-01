"use client";

import * as React from "react";

import { categoryColor } from "@/lib/world/skill-colors";

import type { WorldSkill } from "./world-experience";

export function WorldSkillOverlay({ skill, onClose }: { skill: WorldSkill; onClose: () => void }) {
  const titleId = React.useId();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const accent = categoryColor(skill.category);

  React.useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close skill details overlay"
        className="pointer-events-auto absolute inset-0 z-20 bg-black/40"
        onClick={onClose}
      />
      <dialog
        ref={dialogRef}
        open
        aria-labelledby={titleId}
        className="pointer-events-auto absolute top-1/2 left-1/2 z-30 m-0 w-[min(22rem,88vw)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-2 bg-[#0d0b16] px-5 py-4 shadow-[5px_5px_0_rgba(0,0,0,0.6)] backdrop:bg-transparent"
        style={{ borderColor: accent }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.24em] uppercase" style={{ color: accent }}>
            {skill.category}
          </span>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close skill details"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-[2px] text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            ✕
          </button>
        </div>
        <h3 id={titleId} className="mt-1 text-xl font-bold text-white">
          {skill.label}
        </h3>
        <progress
          max={5}
          value={skill.level}
          aria-label={`Level ${skill.level} of 5`}
          className="mt-2 h-2.5 w-full appearance-none overflow-hidden rounded-[2px] bg-[#322f4a] [&::-moz-progress-bar]:bg-current [&::-webkit-progress-bar]:bg-[#322f4a] [&::-webkit-progress-value]:rounded-[2px]"
          style={{ color: accent }}
        />
        {skill.summary ? <p className="mt-3 text-sm text-white/75">{skill.summary}</p> : null}
      </dialog>
    </>
  );
}
