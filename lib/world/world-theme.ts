/** Long-form copy inside the game world. */
export const PIXEL_READABLE_BODY = "text-base font-normal leading-[1.75]" as const;

/** Dark-game overlays (dialogue, save-file header). */
export const PIXEL_READABLE_ON_DARK =
  "text-base font-normal leading-[1.75] text-white/95 [text-shadow:1px_1px_0_#000]" as const;

export const CHAPTER_ACCENTS = {
  intro: {
    id: "intro",
    label: "Where it began",
    border: "border-indigo-400 dark:border-indigo-400",
    kicker: "text-indigo-800 dark:text-indigo-300",
    heading: "text-indigo-950 dark:text-white dark:[text-shadow:2px_2px_0_#000]",
    panel: "bg-indigo-50/90 dark:bg-[#0a0818]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(129,140,248,0.22)]",
    link: "font-semibold text-indigo-800 hover:text-indigo-950 dark:text-indigo-200 dark:hover:text-indigo-100",
    muted: "text-indigo-700/85 dark:text-indigo-300/70",
    body: "font-medium text-indigo-950 dark:text-indigo-50",
  },
  work: {
    id: "work",
    label: "Building the bridge",
    border: "border-cyan-500 dark:border-cyan-400",
    kicker: "text-cyan-800 dark:text-cyan-300",
    heading: "text-cyan-950 dark:text-white dark:[text-shadow:2px_2px_0_#000]",
    panel: "bg-cyan-50/90 dark:bg-[#081018]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(34,211,238,0.18)]",
    link: "font-semibold text-cyan-800 hover:text-cyan-950 dark:text-cyan-200 dark:hover:text-cyan-100",
    muted: "text-cyan-700/85 dark:text-cyan-300/70",
    body: "font-medium text-cyan-950 dark:text-cyan-50",
  },
  skills: {
    id: "skills",
    label: "The gauntlet",
    border: "border-emerald-500 dark:border-emerald-400",
    kicker: "text-emerald-800 dark:text-emerald-300",
    heading: "text-emerald-950 dark:text-white dark:[text-shadow:2px_2px_0_#000]",
    panel: "bg-emerald-50/90 dark:bg-[#061410]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(52,211,153,0.2)]",
    link: "font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-emerald-100",
    muted: "text-emerald-700/85 dark:text-emerald-300/70",
    body: "font-medium text-emerald-950 dark:text-emerald-50",
  },
  writing: {
    id: "writing",
    label: "The vault",
    border: "border-amber-500 dark:border-amber-400",
    kicker: "text-amber-800 dark:text-amber-300",
    heading: "text-amber-950 dark:text-white dark:[text-shadow:2px_2px_0_#000]",
    panel: "bg-amber-50/90 dark:bg-[#14100c]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(251,191,36,0.18)]",
    link: "font-semibold text-amber-800 hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-100",
    muted: "text-amber-700/85 dark:text-amber-300/70",
    body: "font-medium text-amber-950 dark:text-amber-50",
  },
  contact: {
    id: "contact",
    label: "Rooftop at dusk",
    border: "border-indigo-400 dark:border-indigo-400",
    kicker: "text-indigo-800 dark:text-indigo-300",
    heading: "text-indigo-950 dark:text-white dark:[text-shadow:2px_2px_0_#000]",
    panel: "bg-indigo-50/90 dark:bg-[#0a0818]/96",
    glow: "shadow-[4px_4px_0_var(--pixel-shadow),0_0_24px_rgba(129,140,248,0.22)]",
    link: "font-semibold text-indigo-800 hover:text-indigo-950 dark:text-indigo-200 dark:hover:text-indigo-100",
    muted: "text-indigo-700/85 dark:text-indigo-300/70",
    body: "font-medium text-indigo-950 dark:text-indigo-50",
  },
} as const;
export type ChapterAccentId = keyof typeof CHAPTER_ACCENTS;

export const PORTFOLIO_SHELL = "bg-background text-foreground" as const;

export const WORLD_GAME_SHELL = "bg-pixel-shell text-pixel-fg" as const;

/** @deprecated Use PORTFOLIO_SHELL or WORLD_GAME_SHELL explicitly. */
export const WORLD_SHELL = WORLD_GAME_SHELL;

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
