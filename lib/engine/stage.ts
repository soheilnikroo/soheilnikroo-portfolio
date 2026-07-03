import type { Character } from "./character";
import { clamp01, smoothstep } from "./math";
import { TRANSITION_STYLES, drawTransition } from "./transitions";
import type { RenderSurface } from "./types";

export interface RenderContext {
  readonly surface: RenderSurface;
  readonly character: Character;
  readonly width: number;
  readonly height: number;
  readonly global: number;
  readonly local: number;
  readonly time: number;
}
export interface ChapterScene {
  readonly id: string;
  readonly title: string;
  readonly weight: number;
  draw(rc: RenderContext): void;
}
export interface ChapterBounds {
  readonly id: string;
  readonly title: string;
  readonly start: number;
  readonly end: number;
}
export interface ActiveChapter {
  readonly index: number;
  readonly id: string;
  readonly local: number;
}
const EDGE = 0.05;
export class Stage {
  private readonly surface: RenderSurface;
  private readonly character: Character;
  private readonly chapters: readonly ChapterScene[];
  private readonly bounds: ChapterBounds[];
  constructor(surface: RenderSurface, character: Character, chapters: readonly ChapterScene[]) {
    this.surface = surface;
    this.character = character;
    this.chapters = chapters;
    const totalWeight = chapters.reduce((sum, c) => sum + c.weight, 0) || 1;
    let acc = 0;
    this.bounds = chapters.map((c) => {
      const start = acc / totalWeight;
      acc += c.weight;
      const end = acc / totalWeight;
      return { id: c.id, title: c.title, start, end };
    });
  }
  layout(): readonly ChapterBounds[] {
    return this.bounds;
  }
  resolveActive(global: number): ActiveChapter {
    const g = clamp01(global);
    let index = this.bounds.findIndex((b) => g >= b.start && g < b.end);
    if (index === -1) index = g <= 0 ? 0 : this.bounds.length - 1;
    const bound = this.bounds[index];
    const chapter = this.chapters[index];
    if (!bound || !chapter) return { index: 0, id: this.chapters[0]?.id ?? "", local: 0 };
    const span = Math.max(1e-6, bound.end - bound.start);
    const local = clamp01((g - bound.start) / span);
    return { index, id: chapter.id, local };
  }
  render(global: number): ActiveChapter {
    const active = this.resolveActive(global);
    const chapter = this.chapters[active.index];
    if (!chapter) return active;
    this.surface.resetCameraFocusOverride();
    this.surface.clear();
    chapter.draw({
      surface: this.surface,
      character: this.character,
      width: this.surface.width,
      height: this.surface.height,
      global: clamp01(global),
      local: active.local,
      time: performance.now(),
    });
    if (!this.surface.isCameraFocusOverridden()) {
      this.surface.focusCameraOn(this.character.getCameraFocusX());
    }
    this.drawTransition(active.index, active.local);
    this.surface.present();
    return active;
  }
  private drawTransition(index: number, local: number): void {
    const lastIndex = this.bounds.length - 1;
    let coverage = 0;
    let boundary = 0;
    if (local < EDGE && index > 0) {
      coverage = 1 - smoothstep(local / EDGE);
      boundary = index;
    } else if (local > 1 - EDGE && index < lastIndex) {
      coverage = 1 - smoothstep((1 - local) / EDGE);
      boundary = index + 1;
    }
    if (coverage <= 0.001) return;
    const style = TRANSITION_STYLES[boundary % TRANSITION_STYLES.length] ?? "iris";
    drawTransition(this.surface, style, coverage);
  }
}
