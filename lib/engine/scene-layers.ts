import { loadImage } from "./assets";
import type { Sprite } from "./assets";
import type { RenderSurface } from "./types";

export type LayerAnchor = "ground" | "sky";

export interface SceneLayerDef {
  readonly id: string;
  readonly src: string;
  readonly depth: number;
  readonly tiled: boolean;
  readonly anchor?: LayerAnchor;
  /** Bottom offset from ground line when anchor is ground (px). */
  readonly groundOffset?: number;
}

export interface LandmarkDef {
  readonly id: string;
  readonly src: string;
  readonly worldX: number;
  readonly depth: number;
}

export interface SceneManifest {
  readonly layers: readonly SceneLayerDef[];
  readonly landmarks: readonly LandmarkDef[];
}

export interface LoadedScene {
  readonly layers: ReadonlyMap<string, Sprite>;
  readonly landmarks: ReadonlyMap<string, Sprite>;
}

export async function loadSceneManifest(manifest: SceneManifest): Promise<LoadedScene> {
  const layerEntries = await Promise.all(
    manifest.layers.map(async (layer) => {
      const sprite = await loadImage(layer.src);
      return [layer.id, sprite] as const;
    }),
  );
  const landmarkEntries = await Promise.all(
    manifest.landmarks.map(async (lm) => {
      const sprite = await loadImage(lm.src);
      return [lm.id, sprite] as const;
    }),
  );
  return {
    layers: new Map(layerEntries),
    landmarks: new Map(landmarkEntries),
  };
}

function spriteSize(sprite: Sprite): { w: number; h: number } {
  if (sprite instanceof HTMLImageElement) {
    return { w: sprite.naturalWidth || sprite.width, h: sprite.naturalHeight || sprite.height };
  }
  if (sprite instanceof HTMLCanvasElement) {
    return { w: sprite.width, h: sprite.height };
  }
  const w = "width" in sprite ? Number(sprite.width) : 92;
  const h = "height" in sprite ? Number(sprite.height) : 92;
  return { w, h };
}

function spriteCacheKey(sprite: Sprite): object {
  if (typeof sprite !== "object" || sprite === null) {
    throw new Error("Sprite must be a non-null object");
  }
  return sprite;
}

const footInsetCache = new WeakMap<object, number>();

/**
 * Transparent padding below the lowest opaque pixel in a sprite canvas. PixelLab
 * exports often leave empty rows at the bottom — anchoring the canvas edge to the
 * ground line makes buildings appear to float unless we compensate.
 */
export function footInset(sprite: Sprite): number {
  const key = spriteCacheKey(sprite);
  const cached = footInsetCache.get(key);
  if (cached !== undefined) return cached;

  const { w, h } = spriteSize(sprite);
  if (w <= 0 || h <= 0 || typeof document === "undefined") {
    footInsetCache.set(key, 0);
    return 0;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    footInsetCache.set(key, 0);
    return 0;
  }

  ctx.drawImage(sprite, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  let inset = 0;
  outer: for (let y = h - 1; y >= 0; y -= 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3]! > 12) {
        inset = h - 1 - y;
        break outer;
      }
    }
  }

  footInsetCache.set(key, inset);
  return inset;
}

const deckFracCache = new WeakMap<object, number>();

/**
 * Vertical fraction (0 = top) where a platform sprite's walk surface sits — the
 * widest opaque row. Side-view girders often have empty space above the deck.
 */
export function deckFrac(sprite: Sprite): number {
  const key = spriteCacheKey(sprite);
  const cached = deckFracCache.get(key);
  if (cached !== undefined) return cached;

  const { w, h } = spriteSize(sprite);
  if (w <= 0 || h <= 0 || typeof document === "undefined") {
    deckFracCache.set(key, 0);
    return 0;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    deckFracCache.set(key, 0);
    return 0;
  }

  ctx.drawImage(sprite, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  let bestRow = 0;
  let bestSpan = 0;
  for (let y = 0; y < h; y += 1) {
    let minX = w;
    let maxX = -1;
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3]! > 12) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    const span = maxX >= minX ? maxX - minX + 1 : 0;
    if (span > bestSpan) {
      bestSpan = span;
      bestRow = y;
    }
  }

  const frac = bestSpan > 0 ? bestRow / h : 0;
  deckFracCache.set(key, frac);
  return frac;
}

/** Draw a horizontally repeating parallax layer. */
export function drawTiledLayer(
  surface: RenderSurface,
  sprite: Sprite,
  panX: number,
  depth: number,
  bottomY: number,
  alpha = 1,
): void {
  const { ctx, width } = surface;
  const { w: sw, h: sh } = spriteSize(sprite);
  if (sw <= 0 || sh <= 0) return;
  const off = panX * depth;
  const inset = footInset(sprite);
  const topY = Math.round(bottomY - sh + inset);
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  const start = Math.floor(-off / sw) - 1;
  const end = Math.ceil((width - off) / sw) + 1;
  for (let i = start; i <= end; i += 1) {
    const x = Math.round(i * sw - (off % sw));
    ctx.drawImage(sprite, x, topY, sw, sh);
  }
  ctx.restore();
}

/** Draw a backdrop once, stretched to the viewport width (no horizontal repeat). */
export function drawCoverLayer(
  surface: RenderSurface,
  sprite: Sprite,
  bottomY: number,
  alpha = 1,
): void {
  const { ctx, width } = surface;
  const { w: sw, h: sh } = spriteSize(sprite);
  if (sw <= 0 || sh <= 0) return;
  const inset = footInset(sprite);
  const topY = Math.round(bottomY - sh + inset);
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, 0, topY, width, sh);
  ctx.restore();
}

/** Draw a landmark at a fixed world X with parallax. */
export function drawPlacedSprite(
  surface: RenderSurface,
  sprite: Sprite,
  worldX: number,
  bottomY: number,
  panX: number,
  depth: number,
  alpha = 1,
): void {
  const { ctx } = surface;
  const { w: sw, h: sh } = spriteSize(sprite);
  if (sw <= 0 || sh <= 0) return;
  const screenX = Math.round(worldX - panX * depth);
  const inset = footInset(sprite);
  const topY = Math.round(bottomY - sh + inset);
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, screenX, topY, sw, sh);
  ctx.restore();
}

export async function loadPropSprites(
  paths: Record<string, string>,
  priority = false,
): Promise<Map<string, Sprite>> {
  const entries = await Promise.all(
    Object.entries(paths).map(
      async ([key, src]) =>
        [key, await loadImage(src, priority ? { priority: true } : undefined)] as const,
    ),
  );
  return new Map(entries);
}

export interface SceneAssetsBundle {
  readonly scene: LoadedScene;
  readonly props: ReadonlyMap<string, Sprite>;
  readonly grounds: ReadonlyMap<string, Sprite>;
}

export async function loadWorldAssets(
  manifest: SceneManifest,
  propPaths: Record<string, string>,
  chapterGrounds: Record<string, string>,
): Promise<SceneAssetsBundle> {
  const [scene, props, groundEntries] = await Promise.all([
    loadSceneManifest(manifest),
    loadPropSprites(propPaths),
    Promise.all(
      Object.entries(chapterGrounds).map(async ([ch, src]) => [ch, await loadImage(src)] as const),
    ),
  ]);
  return { scene, props, grounds: new Map(groundEntries) };
}

export interface StagedWorldAssets extends SceneAssetsBundle {
  /** Fetch remaining chapter props and ground tiles without blocking the first frame. */
  hydrate(): Promise<void>;
}

/** Load intro-critical sprites first; defer other chapter art to a background fetch. */
export async function loadWorldAssetsStaged(
  manifest: SceneManifest,
  propPaths: Record<string, string>,
  chapterGrounds: Record<string, string>,
  criticalChapter = "intro",
): Promise<StagedWorldAssets> {
  const criticalProps = Object.fromEntries(
    Object.entries(propPaths).filter(([key]) => key.startsWith(`${criticalChapter}/`)),
  );
  const deferredProps = Object.fromEntries(
    Object.entries(propPaths).filter(([key]) => !key.startsWith(`${criticalChapter}/`)),
  );
  const criticalGrounds: Record<string, string> = {};
  const deferredGrounds: Record<string, string> = {};
  for (const [chapter, src] of Object.entries(chapterGrounds)) {
    if (chapter === criticalChapter) criticalGrounds[chapter] = src;
    else deferredGrounds[chapter] = src;
  }

  const [scene, props, groundEntries] = await Promise.all([
    loadSceneManifest(manifest),
    loadPropSprites(criticalProps, true),
    Promise.all(
      Object.entries(criticalGrounds).map(
        async ([ch, src]) => [ch, await loadImage(src, { priority: true })] as const,
      ),
    ),
  ]);
  const grounds = new Map(groundEntries);

  const hydrate = async (): Promise<void> => {
    const [moreProps, moreGrounds] = await Promise.all([
      loadPropSprites(deferredProps),
      Promise.all(
        Object.entries(deferredGrounds).map(
          async ([ch, src]) => [ch, await loadImage(src)] as const,
        ),
      ),
    ]);
    for (const [key, sprite] of moreProps) props.set(key, sprite);
    for (const [ch, sprite] of moreGrounds) grounds.set(ch, sprite);
  };

  void hydrate();

  return { scene, props, grounds, hydrate };
}

/** Draw a chapter prop sprite anchored at ground baseline. */
export function drawProp(
  surface: RenderSurface,
  sprite: Sprite,
  centerX: number,
  baseline: number,
  scale = 1,
): void {
  const { ctx } = surface;
  const { w: sw, h: sh } = spriteSize(sprite);
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);
  const inset = Math.round(footInset(sprite) * scale);
  const x = Math.round(centerX - dw / 2);
  const y = Math.round(baseline - dh + inset);
  ctx.drawImage(sprite, x, y, dw, dh);
}

/** Stretch a prop to a platform rectangle; `walkY` is the feet / deck line. */
export function drawPropBox(
  surface: RenderSurface,
  sprite: Sprite,
  centerX: number,
  walkY: number,
  boxW: number,
  boxH: number,
): void {
  const { ctx } = surface;
  const { w: sw, h: sh } = spriteSize(sprite);
  if (sw <= 0 || sh <= 0 || boxW <= 0 || boxH <= 0) return;
  const deck = deckFrac(sprite);
  const x = Math.round(centerX - boxW / 2);
  const y = Math.round(walkY - deck * boxH);
  ctx.drawImage(sprite, x, y, Math.round(boxW), Math.round(boxH));
}
