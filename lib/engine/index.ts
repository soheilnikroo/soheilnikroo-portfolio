/**
 * Public surface of the scroll-linked timeline engine.
 */
export { ScrollTimeline } from "./scroll";
export type { ScrollTimelineOptions } from "./scroll";
export { Stage } from "./stage";
export type { ChapterScene, RenderContext, ChapterBounds, ActiveChapter } from "./stage";
export { Character } from "./character";
export type { CharacterManifest, CharacterDraw, ClipName, CharacterLoadOptions } from "./character";
export { Canvas2DSurface } from "./renderer/canvas2d";
export {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  GROUND_FRAC,
  groundY,
  STAGE_BG,
  computeGameViewport,
  applyCameraFocus,
} from "./viewport";
export type { GameViewportRect } from "./viewport";
export { loadWorldAssets, loadWorldAssetsStaged, drawProp, drawPropBox } from "./scene-layers";
export type {
  SceneManifest,
  SceneLayerDef,
  LandmarkDef,
  LoadedScene,
  SceneAssetsBundle,
  StagedWorldAssets,
} from "./scene-layers";
export type { SceneAssets, CityscapeOpts } from "./backdrop";
export { drawCityscape, applyTint } from "./backdrop";
export {
  clamp,
  clamp01,
  lerp,
  inverseLerp,
  mapRange,
  smoothstep,
  loopFrame,
  oneShotFrame,
} from "./math";
export {
  classifyTapZone,
  clientToVirtual,
  nudgeScrollProgress,
  SCROLL_NUDGE,
} from "./gameplay-input";
export type { TapZone } from "./gameplay-input";
export type { Direction, RenderSurface, Vec2, WorldPalette } from "./types";
