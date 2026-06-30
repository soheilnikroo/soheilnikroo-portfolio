import type { Character } from "./character";
import { clamp01, smoothstep } from "./math";
import { TRANSITION_STYLES, drawTransition } from "./transitions";
import type { RenderSurface } from "./types";
import { DESIGN_WIDTH } from "./viewport";

/**
 * Everything a chapter needs to paint a single frame — all of it derived from the
 * scroll scalar. `global` is progress across the whole timeline; `local` is
 * progress within the active chapter (0..1). A chapter must be a *pure* function
 * of these: same input → same frame, so scrolling back rewinds it exactly.
 */
export interface RenderContext {
  readonly surface: RenderSurface;
  readonly character: Character;
  readonly width: number;
  readonly height: number;
  readonly global: number;
  readonly local: number;
  /** Wall-clock ms for ambient (non-reversible) animation: clouds, fireflies, twinkle. */
  readonly time: number;
}

export interface ChapterScene {
  readonly id: string;
  readonly title: string;
  /** Relative scroll length; normalized against the sum of all chapters. */
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

const EDGE = 0.07; // fraction of a chapter spent fading in/out for a cinematic cut

/**
 * Sequences chapters along the timeline and renders the active one. Each chapter
 * owns its full frame (its own "world"); the Stage handles slicing progress and
 * the dark edge-wipe transition between chapters.
 */
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

  /** Chapter ranges in global progress space — used to lay out the scroll track + overlays. */
  layout(): readonly ChapterBounds[] {
    return this.bounds;
  }

  /** Map global scroll progress to the active chapter without painting a frame. */
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

    this.surface.clear();
    this.surface.setCameraFocusX(DESIGN_WIDTH / 2);
    chapter.draw({
      surface: this.surface,
      character: this.character,
      width: this.surface.width,
      height: this.surface.height,
      global: clamp01(global),
      local: active.local,
      time: performance.now(),
    });
    this.drawTransition(active.index, active.local);
    this.surface.present();

    return active;
  }

  /**
   * Cinematic seam between chapters. A different transition style is used per
   * boundary so each "world change" is distinct; coverage is a pure function of
   * how close `local` is to a chapter edge, so it scrubs and reverses exactly.
   */
  private drawTransition(index: number, local: number): void {
    const lastIndex = this.bounds.length - 1;
    let coverage = 0;
    let boundary = 0;
    // Only transition at *internal* seams — never cover the very first entrance
    // or the final exit, so the experience is visible the instant it loads.
    if (local < EDGE && index > 0) {
      coverage = 1 - smoothstep(local / EDGE);
      boundary = index; // entering this chapter from the previous one
    } else if (local > 1 - EDGE && index < lastIndex) {
      coverage = 1 - smoothstep((1 - local) / EDGE);
      boundary = index + 1; // leaving toward the next one
    }
    if (coverage <= 0.001) return;
    const style = TRANSITION_STYLES[boundary % TRANSITION_STYLES.length] ?? "iris";
    drawTransition(this.surface, style, coverage);
  }
}
