import { clamp, clamp01, damp } from "./math";

export interface ScrollTimelineOptions {
  readonly track: HTMLElement;
  readonly onProgress: (progress: number) => void;
  readonly smoothing?: number;
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
    const maxStep = this.maxRate * dt;
    this.smoothed += clamp(desired - this.smoothed, -maxStep, maxStep);
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
