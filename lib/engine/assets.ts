export type Sprite = CanvasImageSource;
const cache = new Map<string, Sprite>();
function placeholder(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 92;
  c.height = 92;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(0, 0, 92, 92);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 88, 88);
  }
  return c;
}
export interface LoadImageOptions {
  readonly priority?: boolean;
}
export function loadImage(src: string, options?: LoadImageOptions): Promise<Sprite> {
  const cached = cache.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve) => {
    const img = new Image();
    if (options?.priority) img.fetchPriority = "high";
    img.decoding = "async";
    img.onload = () => {
      cache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`[engine] sprite failed to load, using placeholder: ${src}`);
      const p = placeholder();
      cache.set(src, p);
      resolve(p);
    };
    img.src = src;
  });
}
export function loadImages(srcs: readonly string[]): Promise<Sprite[]> {
  return Promise.all(srcs.map((src) => loadImage(src)));
}
