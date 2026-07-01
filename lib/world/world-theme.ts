export const CHAPTER_ACCENTS = {
  intro: {
    id: "intro",
    label: "Where it began",
    border: "border-indigo-400 dark:border-indigo-400",
    kicker: "text-indigo-700 dark:text-indigo-300",
    panel: "bg-indigo-50/90 dark:bg-[#0a0818]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(129,140,248,0.22)]",
    link: "text-indigo-700 hover:text-indigo-900 dark:text-indigo-200 dark:hover:text-indigo-100",
    muted: "text-indigo-600/70 dark:text-indigo-300/55",
    body: "text-indigo-900/80 dark:text-indigo-100/80",
  },
  work: {
    id: "work",
    label: "Building the bridge",
    border: "border-cyan-500 dark:border-cyan-400",
    kicker: "text-cyan-700 dark:text-cyan-300",
    panel: "bg-cyan-50/90 dark:bg-[#081018]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(34,211,238,0.18)]",
    link: "text-cyan-700 hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-100",
    muted: "text-cyan-600/70 dark:text-cyan-300/55",
    body: "text-cyan-900/80 dark:text-cyan-100/80",
  },
  skills: {
    id: "skills",
    label: "The gauntlet",
    border: "border-emerald-500 dark:border-emerald-400",
    kicker: "text-emerald-700 dark:text-emerald-300",
    panel: "bg-emerald-50/90 dark:bg-[#061410]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(52,211,153,0.2)]",
    link: "text-emerald-700 hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-emerald-100",
    muted: "text-emerald-600/70 dark:text-emerald-300/55",
    body: "text-emerald-900/80 dark:text-emerald-100/80",
  },
  writing: {
    id: "writing",
    label: "The vault",
    border: "border-amber-500 dark:border-amber-400",
    kicker: "text-amber-700 dark:text-amber-300",
    panel: "bg-amber-50/90 dark:bg-[#14100c]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(251,191,36,0.18)]",
    link: "text-amber-700 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100",
    muted: "text-amber-600/70 dark:text-amber-300/55",
    body: "text-amber-900/80 dark:text-amber-100/80",
  },
  contact: {
    id: "contact",
    label: "Rooftop at dusk",
    border: "border-indigo-400 dark:border-indigo-400",
    kicker: "text-indigo-700 dark:text-indigo-300",
    panel: "bg-indigo-50/90 dark:bg-[#0a0818]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(129,140,248,0.22)]",
    link: "text-indigo-700 hover:text-indigo-900 dark:text-indigo-200 dark:hover:text-indigo-100",
    muted: "text-indigo-600/70 dark:text-indigo-300/55",
    body: "text-indigo-900/80 dark:text-indigo-100/80",
  },
} as const;
export type ChapterAccentId = keyof typeof CHAPTER_ACCENTS;

export const PIXEL_FONT = "[font-family:var(--font-pixel),ui-monospace,monospace]" as const;

export const WORLD_SHELL = `bg-pixel-shell text-pixel-fg ${PIXEL_FONT}` as const;

export const PIXEL_PANEL = "bg-pixel-panel border-pixel-border" as const;

export const PIXEL_CARD =
  "rounded-[4px] border-2 border-pixel-border/40 bg-pixel-panel shadow-[3px_3px_0_var(--pixel-shadow)]" as const;

export const PIXEL_ICON_BTN =
  "inline-flex size-10 items-center justify-center rounded-[3px] border-2 border-pixel-border/60 bg-pixel-btn-bg text-pixel-fg shadow-[2px_2px_0_var(--pixel-shadow)] transition-colors hover:bg-pixel-btn-hover focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:outline-none disabled:opacity-40" as const;

export const PIXEL_HEADING_SHADOW = "[text-shadow:3px_3px_0_var(--pixel-text-shadow)]" as const;

export const PIXEL_PRIMARY_BTN =
  "rounded-[3px] border-2 border-pixel-border bg-primary px-5 py-2.5 text-sm text-primary-foreground shadow-[3px_3px_0_var(--pixel-shadow)] transition-transform hover:-translate-y-0.5" as const;

export const PIXEL_GHOST_BTN =
  "rounded-[3px] border-2 border-pixel-border/50 px-5 py-2.5 text-sm text-pixel-fg/80 shadow-[3px_3px_0_var(--pixel-shadow)] transition-colors hover:border-pixel-border/80" as const;
