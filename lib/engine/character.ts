import { loadImage } from "./assets";
import type { Sprite } from "./assets";
import type { Direction, RenderSurface } from "./types";

export type ClipName = "idle" | "walk" | "run" | "jump" | "climb" | "pull";
export interface CharacterManifest {
  readonly frameSize: number;
  readonly clips: Record<ClipName, Record<Direction, readonly string[]>>;
}
export interface CharacterDraw {
  readonly x: number;
  readonly baseline: number;
  readonly scale: number;
  readonly clip: ClipName;
  readonly frame: number;
  readonly dir: Direction;
  readonly shadow?: boolean;
  readonly bob?: number;
}
type LoadedClips = Record<ClipName, Record<Direction, Sprite[]>>;
const CLIP_NAMES: ClipName[] = ["idle", "walk", "run", "jump", "climb", "pull"];
async function loadClipDir(
  manifest: CharacterManifest,
  name: ClipName,
  priority?: boolean,
): Promise<Record<Direction, Sprite[]>> {
  const toOpts = priority ? { priority: true as const } : undefined;
  const [east, west] = await Promise.all([
    Promise.all(manifest.clips[name].east.map((src) => loadImage(src, toOpts))),
    Promise.all(manifest.clips[name].west.map((src) => loadImage(src, toOpts))),
  ]);
  return { east, west };
}
function emptyClipDir(): Record<Direction, Sprite[]> {
  return { east: [], west: [] };
}
export interface CharacterLoadOptions {
  readonly priorityClips?: readonly ClipName[];
}
const FOOT_FRAC = 0.79;
export class Character {
  readonly frameSize: number;
  private clips: LoadedClips;
  private constructor(frameSize: number, clips: LoadedClips) {
    this.frameSize = frameSize;
    this.clips = clips;
  }
  static async load(
    manifest: CharacterManifest,
    options?: CharacterLoadOptions,
  ): Promise<Character> {
    const priority = options?.priorityClips ?? CLIP_NAMES;
    const deferred = CLIP_NAMES.filter((name) => !priority.includes(name));
    const priorityLoaded = await Promise.all(
      priority.map((name) => loadClipDir(manifest, name, true)),
    );
    const clips = Object.fromEntries(
      priority.map((name, i) => [name, priorityLoaded[i]]),
    ) as Partial<LoadedClips>;
    for (const name of deferred) {
      clips[name] = emptyClipDir();
    }
    const character = new Character(manifest.frameSize, clips as LoadedClips);
    if (deferred.length > 0) {
      void Promise.all(deferred.map((name) => loadClipDir(manifest, name))).then((loaded) => {
        for (let i = 0; i < deferred.length; i += 1) {
          const name = deferred[i];
          const clip = loaded[i];
          if (name && clip) character.clips[name] = clip;
        }
      });
    }
    return character;
  }
  frameCount(clip: ClipName, dir: Direction): number {
    return this.clips[clip]?.[dir].length ?? 0;
  }
  draw(surface: RenderSurface, opts: CharacterDraw): void {
    let dirFrames = this.clips[opts.clip]?.[opts.dir];
    if (!dirFrames || dirFrames.length === 0) {
      dirFrames = this.clips.walk?.[opts.dir];
    }
    if (!dirFrames || dirFrames.length === 0) return;
    const index = Math.min(dirFrames.length - 1, Math.max(0, opts.frame));
    const img = dirFrames[index];
    if (!img) return;
    const size = this.frameSize * opts.scale;
    const sx = Math.round(opts.x - size / 2);
    const bob = opts.bob ?? 0;
    const sy = Math.round(opts.baseline - size * FOOT_FRAC + bob);
    const { ctx } = surface;
    if (opts.shadow !== false) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(opts.x, opts.baseline + 1, size * 0.26, size * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, size, size);
  }
}
