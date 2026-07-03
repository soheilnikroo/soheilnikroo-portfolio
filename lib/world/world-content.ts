import type { CharacterManifest, SceneManifest, WorldPalette } from "@/lib/engine";

import { worldAssetUrl } from "./asset-url";

const WALK = [0, 1, 2, 3, 4, 5] as const;
const RUN = [0, 1, 2, 3] as const;
const JUMP = [0, 1, 2, 3, 4, 5] as const;
const IDLE = [0, 1, 2, 3] as const;
const dir = (clip: string, frames: readonly number[]) => ({
  east: frames.map((i) => worldAssetUrl(`/world/character/${clip}/east/${i}.png`)),
  west: frames.map((i) => worldAssetUrl(`/world/character/${clip}/west/${i}.png`)),
});
export const characterManifest: CharacterManifest = {
  frameSize: 68,
  clips: {
    idle: dir("idle", IDLE),
    walk: dir("walk", WALK),
    run: dir("run", RUN),
    jump: dir("jump", JUMP),
    climb: dir("climb", [0, 1, 2, 3, 4, 5] as const),
    pull: dir("pull", WALK),
  },
};
export interface ChapterSceneProfile {
  readonly layers: Readonly<Partial<Record<string, number>>>;
  readonly landmarks: Readonly<Partial<Record<string, number>>>;
}
export const CHAPTER_SCENE_PROFILES: Record<string, ChapterSceneProfile> = {
  intro: {
    layers: { "alborz-mountains": 0.42, "tehran-skyline-far": 0.28 },
    landmarks: {},
  },
  work: {
    layers: { "alborz-mountains": 0.48, "tehran-skyline-far": 0.52, "tehran-buildings-mid": 0.42 },
    landmarks: { "azadi-tower": 0.32 },
  },
  skills: {
    layers: { "tehran-skyline-far": 0.38, "tehran-buildings-mid": 0.28 },
    landmarks: {},
  },
  writing: {
    layers: { "alborz-mountains": 0.32, "tehran-skyline-far": 0.44, "tehran-buildings-mid": 0.22 },
    landmarks: { "persian-domes": 0.38 },
  },
  contact: {
    layers: { "alborz-mountains": 0.28, "tehran-skyline-far": 0.5 },
    landmarks: { "milad-tower": 0.88 },
  },
};
export const sceneManifest: SceneManifest = {
  layers: [
    {
      id: "intro-hero-dawn",
      src: worldAssetUrl("/world/scenes/intro-hero-dawn.png"),
      depth: 0.12,
      tiled: false,
      anchor: "ground",
    },
    {
      id: "alborz-mountains",
      src: worldAssetUrl("/world/scenes/alborz-mountains.png"),
      depth: 0.08,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-skyline-far",
      src: worldAssetUrl("/world/scenes/tehran-skyline-far.png"),
      depth: 0.22,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-buildings-mid",
      src: worldAssetUrl("/world/scenes/tehran-buildings-mid.png"),
      depth: 0.45,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-shopfronts",
      src: worldAssetUrl("/world/scenes/tehran-shopfronts.png"),
      depth: 0.72,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "tehran-ground-tiles",
      src: worldAssetUrl("/world/scenes/tehran-ground-tiles.png"),
      depth: 1.0,
      tiled: true,
      anchor: "ground",
    },
    {
      id: "chenar-trees",
      src: worldAssetUrl("/world/scenes/chenar-trees.png"),
      depth: 1.35,
      tiled: true,
      anchor: "ground",
    },
  ],
  landmarks: [
    {
      id: "milad-tower",
      src: worldAssetUrl("/world/scenes/milad-tower.png"),
      worldX: 320,
      depth: 0.06,
    },
    {
      id: "azadi-tower",
      src: worldAssetUrl("/world/scenes/azadi-tower.png"),
      worldX: 180,
      depth: 0.42,
    },
    {
      id: "persian-domes",
      src: worldAssetUrl("/world/scenes/persian-domes.png"),
      worldX: 260,
      depth: 0.5,
    },
  ],
};
export const propPaths: Record<string, string> = {
  "intro/childhood-house": worldAssetUrl("/world/objects/intro/childhood-house.png"),
  "intro/road-pit": worldAssetUrl("/world/objects/intro/road-pit.png"),
  "intro/crt-monitor": worldAssetUrl("/world/objects/intro/crt-monitor.png"),
  "intro/bedroom-window": worldAssetUrl("/world/objects/intro/bedroom-window.png"),
  "work/construction-crane": worldAssetUrl("/world/objects/work/construction-crane.png"),
  "work/bridge-girder": worldAssetUrl("/world/objects/work/bridge-girder.png"),
  "work/wooden-crate": worldAssetUrl("/world/objects/work/wooden-crate.png"),
  "work/work-building": worldAssetUrl("/world/objects/work/work-building.png"),
  "skills/skill-slime": worldAssetUrl("/world/objects/skills/skill-slime.png"),
  "skills/metro-sign": worldAssetUrl("/world/objects/skills/metro-sign.png"),
  "writing/treasure-chest": worldAssetUrl("/world/objects/writing/treasure-chest.png"),
  "writing/bookshelf": worldAssetUrl("/world/objects/writing/bookshelf.png"),
  "contact/rooftop-cafe": worldAssetUrl("/world/objects/contact/rooftop-cafe.png"),
};
export const chapterGroundTiles: Record<string, string> = {
  intro: worldAssetUrl("/world/tilesets/intro/ground.png"),
  work: worldAssetUrl("/world/tilesets/work/ground.png"),
  skills: worldAssetUrl("/world/tilesets/skills/ground.png"),
  writing: worldAssetUrl("/world/tilesets/writing/ground.png"),
  contact: worldAssetUrl("/world/tilesets/contact/ground.png"),
};
export const PALETTES: Record<string, WorldPalette> = {
  dawn: {
    skyTop: "#1e1038",
    skyMid: "#7a4060",
    skyHorizon: "#f4c080",
    haze: "#ecc898",
    cloud: "#ffe8d0",
    mountains: "#5a6878",
    mountainNear: "#4a5568",
    buildings: "#5a3028",
    windows: "#ffd890",
    windowAlt: "#38c8d8",
    ground: "#4a4038",
    foreground: "#2a4030",
    sun: "255,228,180",
    particle: "255,210,150",
    tint: "rgba(240,190,140,0.05)",
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
export type { StoryBeat } from "@/lib/schemas/world-narrative";
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
