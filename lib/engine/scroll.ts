import { clamp, clamp01, damp } from "./math";

/**
 * Turns native page scrolling over a tall "track" element into a single smoothed
 * progress scalar (0..1). Native scroll is the *only* input: the scrollbar,
 * trackpad, touch, and Page Up/Down all drive it, and rewinding is inherent.
 *
 * Two-stage conditioning makes the pacing feel *directed* rather than twitchy:
 *   1. Exponential smoothing toward the scroll target (momentum / weight).
 *   2. A hard **max playback rate** — progress can only change so fast per second,
 *      so spinning the wheel aggressively can't fast-forward the story; it just
 *      keeps advancing at a cinematic pace until it catches up.
 * Progress stays a monotonic function of scroll, so reversal is still exact.
 */
export interface ScrollTimelineOptions {
  /** The tall element whose travel through the viewport defines progress. */
  readonly track: HTMLElement;
  readonly onProgress: (progress: number) => void;
  /** Smoothing strength (lambda). <= 0 disables smoothing. */
  readonly smoothing?: number;
  /** Maximum progress units per second (caps playback speed). */
  readonly maxRate?: number;
}

export class ScrollTimeline {
  private readonly track: HTMLElement;
  private readonly onProgress: (p: number) => void;
  private readonly lambda: number;
  private readonly maxRate: number;

  private raf = 0;
  private running = false;
  private smoothed = 0;
  private lastTime = 0;
  private warnedError = false;

  constructor(options: ScrollTimelineOptions) {
    this.track = options.track;
    this.onProgress = options.onProgress;
    this.lambda = options.smoothing ?? 6;
    this.maxRate = options.maxRate ?? 0.16;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.smoothed = this.measure();
    this.lastTime = performance.now();
    this.onProgress(this.smoothed);
    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private measure(): number {
    const rect = this.track.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    if (distance <= 0) return 0;
    return clamp01(-rect.top / distance);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const target = this.measure();
    const desired = this.lambda > 0 ? damp(this.smoothed, target, this.lambda, dt) : target;
    // Clamp the per-frame change so playback can never exceed maxRate.
    const maxStep = this.maxRate * dt;
    this.smoothed += clamp(desired - this.smoothed, -maxStep, maxStep);

    // A draw error in one frame must never kill the loop and hard-freeze the page.
    // Catch it, log once, and keep scheduling frames so the experience stays alive.
    try {
      this.onProgress(this.smoothed);
    } catch (err) {
      if (!this.warnedError) {
        this.warnedError = true;
        console.error("[engine] frame render failed; keeping the timeline alive", err);
      }
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}
