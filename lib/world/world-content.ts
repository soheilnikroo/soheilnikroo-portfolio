import type { CharacterManifest, SceneManifest, WorldPalette } from "@/lib/engine";

/**
 * Static configuration for the scroll-linked journey. Pure data — only *types* are
 * imported from the engine, so this module adds no engine code to the route bundle.
 */

const WALK = [0, 1, 2, 3, 4, 5] as const;
const RUN = [0, 1, 2, 3] as const;
const JUMP = [0, 1, 2, 3, 4, 5] as const;
const IDLE = [0, 1, 2, 3] as const;
const dir = (clip: string, frames: readonly number[]) => ({
  east: frames.map((i) => `/world/character/${clip}/east/${i}.png`),
  west: frames.map((i) => `/world/character/${clip}/west/${i}.png`),
});

export const characterManifest: CharacterManifest = {
  frameSize: 68,
  clips: {
    idle: dir("idle", IDLE),
    walk: dir("walk", WALK),
    run: dir("run", RUN),
    jump: dir("jump", JUMP),
    climb: dir("walk", WALK),
    pull: dir("pull", WALK),
  },
};

/** Parallax background layers + Tehran landmarks (authored pixel art). */
export const sceneManifest: SceneManifest = {
  layers: [
    {
      id: "intro-hero-dawn",
      src: "/world/scenes/intro-hero-dawn.png",
      depth: 0.12,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "alborz-mountains",
      src: "/world/scenes/alborz-mountains.png",
      depth: 0.08,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-skyline-far",
      src: "/world/scenes/tehran-skyline-far.png",
      depth: 0.22,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-buildings-mid",
      src: "/world/scenes/tehran-buildings-mid.png",
      depth: 0.45,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-shopfronts",
      src: "/world/scenes/tehran-shopfronts.png",
      depth: 0.72,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-ground-tiles",
      src: "/world/scenes/tehran-ground-tiles.png",
      depth: 1.0,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "chenar-trees",
      src: "/world/scenes/chenar-trees.png",
      depth: 1.35,
      tiled: true,
      anchor: "ground",
    },
  ],
  landmarks: [
    {
      id: "milad-tower",
      src: "/world/scenes/milad-tower.png",
      worldX: 320,
      depth: 0.06,
    },
    {
      id: "azadi-tower",
      src: "/world/scenes/azadi-tower.png",
      worldX: 180,
      depth: 0.42,
    },
    {
      id: "persian-domes",
      src: "/world/scenes/persian-domes.png",
      worldX: 260,
      depth: 0.5,
    },
  ],
};

/** Chapter prop sprite paths keyed as `chapterId/propId`. */
export const propPaths: Record<string, string> = {
  "intro/childhood-house": "/world/objects/intro/childhood-house.png",
  "intro/road-pit": "/world/objects/intro/road-pit.png",
  "intro/crt-monitor": "/world/objects/intro/crt-monitor.png",
  "intro/bedroom-window": "/world/objects/intro/bedroom-window.png",
  "work/construction-crane": "/world/objects/work/construction-crane.png",
  "work/bridge-girder": "/world/objects/work/bridge-girder.png",
  "work/wooden-crate": "/world/objects/work/wooden-crate.png",
  "work/work-building": "/world/objects/work/work-building.png",
  "skills/skill-slime": "/world/objects/skills/skill-slime.png",
  "skills/metro-sign": "/world/objects/skills/metro-sign.png",
  "writing/treasure-chest": "/world/objects/writing/treasure-chest.png",
  "writing/bookshelf": "/world/objects/writing/bookshelf.png",
  "contact/rooftop-cafe": "/world/objects/contact/rooftop-cafe.png",
};

/** Per-chapter ground tile overrides (swapped in drawCityscape). */
export const chapterGroundTiles: Record<string, string> = {
  intro: "/world/tilesets/intro/ground.png",
  work: "/world/tilesets/work/ground.png",
  skills: "/world/tilesets/skills/ground.png",
  writing: "/world/tilesets/writing/ground.png",
  contact: "/world/tilesets/contact/ground.png",
};

/** Distinct colour worlds per chapter — drives the procedural backdrop + mood wash. */
export const PALETTES: Record<string, WorldPalette> = {
  dawn: {
    skyTop: "#2a1848",
    skyMid: "#8a4868",
    skyHorizon: "#f0b878",
    haze: "#e8c8a0",
    cloud: "#ffe8c8",
    mountains: "#5a6878",
    mountainNear: "#4a5568",
    buildings: "#6a3828",
    windows: "#ffd080",
    windowAlt: "#2cb8c8",
    ground: "#5a5040",
    foreground: "#2a4030",
    sun: "255,220,160",
    particle: "255,210,150",
    tint: "rgba(240,200,150,0.06)",
  },
  depot: {
    skyTop: "#2a2838",
    skyMid: "#6a5048",
    skyHorizon: "#e8a060",
    haze: "#d4b890",
    cloud: "#dcc8a8",
    mountains: "#4a5060",
    mountainNear: "#3a4050",
    buildings: "#6a4030",
    windows: "#d4af37",
    windowAlt: "#1c9aaa",
    ground: "#4a4438",
    foreground: "#1a2818",
    sun: "255,190,120",
    particle: "255,180,100",
    tint: "rgba(183,115,51,0.1)",
  },
  arena: {
    skyTop: "#1a2848",
    skyMid: "#3a5888",
    skyHorizon: "#88b8d8",
    haze: "#a8c8e0",
    cloud: "#6888a8",
    mountains: "#2a3858",
    mountainNear: "#2a3858",
    buildings: "#4a3848",
    windows: "#d4af37",
    windowAlt: "#1c9aaa",
    ground: "#3a3840",
    foreground: "#1a3020",
    sun: "200,220,255",
    particle: "180,210,240",
    tint: "rgba(28,63,149,0.08)",
  },
  vault: {
    skyTop: "#1a2838",
    skyMid: "#3a5848",
    skyHorizon: "#c89060",
    haze: "#d8b090",
    cloud: "#6a8878",
    mountains: "#2a3840",
    mountainNear: "#2a3840",
    buildings: "#4a3830",
    windows: "#d4af37",
    windowAlt: "#1c9aaa",
    ground: "#3a3830",
    foreground: "#1a2818",
    sun: "255,200,140",
    particle: "220,180,120",
    tint: "rgba(183,77,53,0.09)",
  },
  rooftop: {
    skyTop: "#080818",
    skyMid: "#1a2848",
    skyHorizon: "#3a5888",
    haze: "#4a6898",
    cloud: "#1a2840",
    mountains: "#0a1028",
    mountainNear: "#0a1028",
    buildings: "#1a1830",
    windows: "#ffd9a0",
    windowAlt: "#1c9aaa",
    ground: "#141420",
    foreground: "#0a1018",
    sun: "255,240,200",
    particle: "255,224,170",
    tint: "rgba(28,154,170,0.07)",
  },
};

/** Chapter ids + relative scroll lengths. Mirrored by `createChapters` and used to
 *  size the scroll track on the server (so it is correct before hydration). */
export const CHAPTER_META = [
  { id: "intro", title: "Where it began", weight: 3.2 },
  { id: "work", title: "Building the bridge", weight: 3.8 },
  { id: "skills", title: "The gauntlet", weight: 3.6 },
  { id: "writing", title: "The vault", weight: 2 },
  { id: "contact", title: "Rooftop at dusk", weight: 2 },
] as const;

// Long, platformer-campaign pacing: each weight unit is a generous stretch of scroll.
export const VH_PER_WEIGHT = 210;

export function trackHeightVh(): number {
  const total = CHAPTER_META.reduce((sum, c) => sum + c.weight, 0);
  return Math.round(total * VH_PER_WEIGHT);
}

export const INTRO_PROSE =
  "I grew up in Tehran. In high school — Python 2, a turtle on the screen — I was behind my classmates but I didn't quit. Private institute, C#, then the web: React, Quera, long nights. Internship at ILIA Corporation, frontend at Jaan, and since 2022 Frontend Engineer at Snapp building PWAs at scale. Computer Science at Islamic Azad University (expected 2025). These days I'm also learning Swift & SwiftUI and dipping into Rust. This site tells that story like a game — because that's how learning has always felt to me.";

/**
 * Narration track. Each chapter has several short lines keyed to a local-progress
 * threshold; the active line advances as you scroll through the scene and rewinds
 * exactly when you scroll back. This is what gives the journey narrative weight
 * without adding a second scroll behaviour.
 */
export interface StoryBeat {
  readonly at: number;
  readonly text: string;
}

export const STORY_BEATS: Record<string, readonly StoryBeat[]> = {
  intro: [
    { at: 0.02, text: "A new journey begins." },
    { at: 0.08, text: "Tehran, just before sunrise." },
    { at: 0.14, text: "I take my first steps." },
    { at: 0.24, text: "I still remember that turtle — my first line on the screen." },
    { at: 0.32, text: "I wasn't the fastest. I just didn't stop." },
    { at: 0.38, text: "The road breaks ahead. Sometimes you have to leap." },
    { at: 0.46, text: "I jump — and land on the other side." },
    { at: 0.52, text: "Step after step. Institute. C#. Then the web." },
    { at: 0.62, text: "React, Quera, long nights — catching up my own way." },
    { at: 0.72, text: "ILIA. Jaan. Then Snapp — each step a little bigger." },
    { at: 0.78, text: "Islamic Azad University — CS degree, still in progress." },
    { at: 0.82, text: "These days: React, Next.js, PWAs — and Swift on the side." },
    { at: 0.9, text: "I pause here — but the story keeps going." },
  ],
  work: [
    { at: 0, text: "Snapp. Jaan. ILIA. Every role was a bridge." },
    { at: 0.12, text: "Millions of users. PWAs. Mobile-first — that's the work I care about." },
    { at: 0.28, text: "Haul it up. Lock it in." },
    { at: 0.48, text: "Each ? box is a job — tap to see what I built there." },
    { at: 0.68, text: "Tap a ? box — I'll tell you what we built." },
    { at: 0.88, text: "The crossing holds. On to what's next." },
  ],
  skills: [
    { at: 0, text: "TypeScript + React + Next.js — that's production home base." },
    { at: 0.15, text: "Architecture & design patterns — how code survives scale." },
    { at: 0.3, text: "PWAs, performance, mobile-first — real users, real devices." },
    { at: 0.45, text: "UI kit, Redux Toolkit, SWR — systems, not one-off screens." },
    { at: 0.58, text: "Testing, CI/CD, quality — ship with confidence." },
    { at: 0.72, text: "Tap a skill for the full stats." },
    { at: 0.88, text: "Side quests: Swift/SwiftUI, Rust — always learning." },
  ],
  writing: [
    { at: 0, text: "When I figured something out, I wrote it down." },
    { at: 0.08, text: "The first chest is my résumé — tap it when you're ready." },
    { at: 0.22, text: "Scroll right — each chest after that is an article." },
    { at: 0.55, text: "Open a chest, read it — it's yours too." },
    { at: 0.75, text: "Knowledge only counts if you pass it on." },
  ],
  contact: [
    { at: 0, text: "The climb ends on a rooftop over the city." },
    { at: 0.22, text: "Tehran at night. Quiet. Full of light." },
    { at: 0.42, text: "If any of this felt familiar — let's talk." },
    { at: 0.62, text: "Email, GitHub, LinkedIn — one tap away." },
    { at: 0.82, text: "Life is a lot like a game. It depends how you play it." },
  ],
};

/** Short quest hint shown in the HUD — tells players what this chapter is about. */
export const CHAPTER_GOALS: Record<string, string> = {
  intro: "About me · origin story",
  work: "Work · tap ? boxes to reveal jobs",
  skills: "Skills · tap to inspect stats",
  writing: "Résumé chest · tap it, then scroll for posts",
  contact: "Contact · say hello",
};

export interface StoryProfile {
  readonly name: string;
  readonly role: string;
  readonly tagline: string;
  readonly summary: string;
  readonly location: string;
}

export interface StoryMilestone {
  readonly period: string;
  readonly title: string;
  readonly description: string;
}

/** Merge profile-specific lines into the intro narration at runtime. */
export function personalizeIntroBeats(
  _profile: StoryProfile,
  _milestones: readonly StoryMilestone[],
): readonly StoryBeat[] {
  return STORY_BEATS.intro ?? [];
}

export function beatsForChapter(
  chapterId: string,
  profile: StoryProfile,
  milestones: readonly StoryMilestone[],
): readonly StoryBeat[] {
  if (chapterId === "intro") return personalizeIntroBeats(profile, milestones);
  return STORY_BEATS[chapterId] ?? [];
}
