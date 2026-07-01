"use client";
import { categoryColor } from "@/lib/world/skill-colors";

import type { WorldSkill } from "./world-experience";

export function WorldSkillOverlay({ skill, onClose }: { skill: WorldSkill; onClose: () => void }) {
  const accent = categoryColor(skill.category);
  return (
    <div
      className="pointer-events-auto absolute top-1/2 left-1/2 z-30 w-[min(22rem,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-2 bg-[#0d0b16] px-5 py-4 shadow-[5px_5px_0_rgba(0,0,0,0.6)]"
      style={{ borderColor: accent }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.24em] uppercase" style={{ color: accent }}>
          {skill.category}
        </span>
        <button
          type="button"
          aria-label="Close skill details"
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-[2px] text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          ✕
        </button>
      </div>
      <h3 className="mt-1 text-xl font-bold text-white">{skill.label}</h3>
      <div className="mt-2 flex gap-1" aria-label={`Level ${skill.level} of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-2.5 w-6"
            style={{
              backgroundColor: i < skill.level ? accent : "#322f4a",
            }}
          />
        ))}
      </div>
      {skill.summary ? <p className="mt-3 text-sm text-white/75">{skill.summary}</p> : null}
    </div>
  );
}
