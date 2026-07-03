import {
  applyTint,
  clamp,
  clamp01,
  drawCityscape,
  drawProp,
  drawPropBox,
  groundY,
  lerp,
  loopFrame,
  mapRange,
  oneShotFrame,
  smoothstep,
} from "@/lib/engine";
import type {
  ChapterScene,
  CityscapeOpts,
  ClipName,
  LoadedScene,
  RenderContext,
  SceneAssets,
} from "@/lib/engine";
import type { Sprite } from "@/lib/engine/assets";
import { categoryColor } from "@/lib/world/skill-colors";

import { drawTapMeHint, interactionShake } from "./canvas-hints";
import { drawSkillBadge } from "./skill-badges";
import { workCameraFocusX, workChapterBuildT } from "./work-bridge";
import { CHAPTER_SCENE_PROFILES, PALETTES, sceneManifest } from "./world-content";
import { drawTapPointer, vaultCharacterTravel, vaultLayout } from "./writing-vault";

export interface SkillInfo {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  readonly level: number;
}
export interface ChapterData {
  readonly projectCount: number;
  readonly skills: readonly SkillInfo[];
  readonly postCount: number;
  readonly scene: LoadedScene;
  readonly props: ReadonlyMap<string, Sprite>;
  readonly grounds: ReadonlyMap<string, Sprite>;
  readonly getWorkOpen?: () => ReadonlyMap<number, number>;
}
function characterScale(height: number): number {
  return clamp(Math.round((height * 0.2) / 92), 1, 3);
}
function charBob(clip: ClipName, time: number): number {
  if (clip === "idle") return Math.sin(time / 320) * 2.2;
  if (clip === "walk" || clip === "run" || clip === "climb") return Math.sin(time / 120) * -1.4;
  return 0;
}
function drawTapHint(ctx: CanvasRenderingContext2D, cx: number, gy: number, time: number): void {
  const pulse = 0.55 + 0.45 * Math.sin(time / 280);
  const ax = Math.round(cx + 36 + pulse * 6);
  const ay = Math.round(gy - 52);
  ctx.fillStyle = `rgba(255,236,190,${(0.75 + pulse * 0.25).toFixed(3)})`;
  for (let i = 0; i < 3; i += 1) {
    const ox = ax + i * 10;
    ctx.fillRect(ox, ay, 6, 2);
    ctx.fillRect(ox + 4, ay - 2, 2, 6);
  }
  ctx.font = "8px monospace";
  ctx.fillStyle = `rgba(255,255,255,${(0.55 + pulse * 0.35).toFixed(3)})`;
  ctx.fillText("TAP →", Math.round(cx - 18), Math.round(gy - 68));
}
function prop(data: ChapterData, key: string): Sprite | undefined {
  return data.props.get(key);
}
function sceneAssets(data: ChapterData, chapterId: string): SceneAssets | undefined {
  if (!data.scene.layers.size) return undefined;
  return {
    scene: data.scene,
    manifest: sceneManifest,
    groundSprite: data.grounds.get(chapterId),
  };
}
function cityscapeOpts(chapterId: string, extra?: CityscapeOpts): CityscapeOpts {
  const profile = CHAPTER_SCENE_PROFILES[chapterId];
  return {
    layerWeights: profile?.layers,
    landmarkWeights: profile?.landmarks,
    ...extra,
  };
}
function glowCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rgb: string,
): void {
  const rings: readonly [number, number][] = [
    [1.9, 0.1],
    [1.4, 0.22],
    [1.0, 1],
  ];
  for (const [scale, alpha] of rings) {
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  accent: string,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = clamp01(alpha);
  ctx.fillStyle = accent;
  ctx.fillRect(Math.round(x - r), Math.round(y - 1), Math.round(r * 2), 2);
  ctx.fillRect(Math.round(x - 1), Math.round(y - r), 2, Math.round(r * 2));
  ctx.fillStyle = "#ffffff";
  const c = Math.max(2, Math.round(r * 0.7));
  ctx.fillRect(Math.round(x - c / 2), Math.round(y - c / 2), c, c);
  ctx.restore();
}
function drawMysteryBox(
  surface: RenderContext["surface"],
  cx: number,
  bottomY: number,
  size: number,
  builtT: number,
  time: number,
  seed: number,
  crate?: Sprite,
  openT = 0,
): void {
  const s = Math.max(10, Math.round(size));
  const shake = openT < 0.1 ? interactionShake(time, seed, builtT >= 0.999) : 0;
  const bob = builtT >= 0.999 && openT < 0.5 ? Math.sin(time / 320 + seed) * 2 : 0;
  const y = Math.round(bottomY - bob + shake);
  const ctx = surface.ctx;
  if (openT > 0.05 && crate) {
    const lift = openT * s * 0.35;
    drawProp(surface, crate, cx, y - lift, s / 48);
    if (openT > 0.2) {
      ctx.save();
      ctx.globalAlpha = openT * 0.5;
      for (let i = 0; i < 6; i += 1) {
        const ang = (i / 6) * Math.PI * 2 + time / 400;
        const px = cx + Math.cos(ang) * (8 + openT * 14);
        const py = y - s - lift + Math.sin(ang) * 6;
        ctx.fillStyle = "#ffe08a";
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
      ctx.restore();
    }
    if (openT < 0.85) {
      ctx.fillStyle = "#5a3a0a";
      ctx.font = `bold ${Math.round(s * 0.5)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 1 - openT;
      ctx.fillText("?", cx, y - lift - s * 0.15);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.globalAlpha = 1;
    }
    return;
  }
  if (crate) {
    drawProp(surface, crate, cx, y, s / 48);
    const boxTop = y - s;
    ctx.fillStyle = "#5a3a0a";
    ctx.font = `bold ${Math.round(s * 0.62)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, boxTop + s * 0.54);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if (builtT >= 0.999 && openT < 0.1) {
      drawTapMeHint(ctx, cx, boxTop, time, seed);
    }
    return;
  }
  const x = Math.round(cx - s / 2);
  const boxY = Math.round(bottomY - s - bob);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + 1, s * 0.42, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a72e";
  ctx.fillRect(x, boxY, s, s);
  ctx.fillStyle = "#f6d479";
  ctx.fillRect(x, boxY, s, 3);
  ctx.fillRect(x, boxY, 3, s);
  ctx.fillStyle = "#a9741a";
  ctx.fillRect(x, boxY + s - 3, s, 3);
  ctx.fillRect(x + s - 3, boxY, 3, s);
  ctx.fillStyle = "#5a3a0a";
  ctx.font = `bold ${Math.round(s * 0.62)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", cx, boxY + s * 0.54);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
function drawChestProp(
  surface: RenderContext["surface"],
  sprite: Sprite,
  cx: number,
  baseY: number,
  openT: number,
  time = 0,
  active = false,
  loot: "post" | "resume" = "post",
): void {
  const ctx = surface.ctx;
  const size = 48;
  const shake = active && openT < 0.2 ? interactionShake(time, cx, true) : 0;
  const drawY = baseY + shake;
  const x = Math.round(cx - size / 2);
  if (openT > 0.45) {
    const burst = clamp01((openT - 0.45) / 0.55);
    ctx.save();
    for (let r = 0; r < 8; r += 1) {
      const ang = (r / 8) * Math.PI * 2 + time / 900;
      const len = 8 + burst * 28;
      const ex = cx + Math.cos(ang) * len;
      const ey = baseY - size * 0.55 + Math.sin(ang) * len * 0.45;
      ctx.strokeStyle = `rgba(255,220,120,${(burst * 0.55).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, baseY - size * 0.55);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (active && openT > 0.02) {
    const steps = 5;
    const bandH = size / steps;
    for (let i = 0; i < steps; i += 1) {
      const a = 0.42 * openT * ((i + 1) / steps);
      ctx.fillStyle = `rgba(120,255,200,${a.toFixed(3)})`;
      ctx.fillRect(x - 10, drawY - size - bandH * (i + 1) - 8, size + 20, bandH);
    }
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 + time / 400;
      const r = 14 + openT * 22 + Math.sin(time / 200 + i) * 4;
      const sx = cx + Math.cos(a) * r;
      const sy = baseY - size - 10 + Math.sin(a) * r * 0.5;
      ctx.fillStyle = `rgba(255,236,170,${(openT * 0.95).toFixed(3)})`;
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
    }
  }
  if (openT > 0.35) {
    const lift = clamp01((openT - 0.35) / 0.65);
    const scrollY = baseY - size - 6 - lift * 22 - Math.sin(time / 280) * 2;
    const scrollW = Math.round(14 + lift * 4);
    const scrollH = Math.round(18 + lift * 6);
    const scrollFill =
      loot === "resume"
        ? `rgba(255,236,160,${(0.55 + lift * 0.45).toFixed(3)})`
        : `rgba(255,248,220,${(0.5 + lift * 0.5).toFixed(3)})`;
    ctx.fillStyle = scrollFill;
    ctx.fillRect(Math.round(cx - scrollW / 2), Math.round(scrollY), scrollW, scrollH);
    if (loot === "resume") {
      ctx.fillStyle = `rgba(180,60,40,${(0.55 + lift * 0.4).toFixed(3)})`;
      ctx.fillRect(Math.round(cx - 3), Math.round(scrollY + scrollH - 5), 6, 4);
      ctx.fillStyle = `rgba(80,50,20,${(0.7 + lift * 0.3).toFixed(3)})`;
      ctx.fillRect(Math.round(cx - 4), Math.round(scrollY + 4), 8, 2);
      ctx.fillRect(Math.round(cx - 3), Math.round(scrollY + 9), 6, 2);
    } else {
      ctx.fillStyle = `rgba(212,175,55,${(0.6 + lift * 0.4).toFixed(3)})`;
      ctx.fillRect(Math.round(cx - scrollW / 2 + 2), Math.round(scrollY + 3), scrollW - 4, 2);
      ctx.fillRect(Math.round(cx - scrollW / 2 + 2), Math.round(scrollY + 8), scrollW - 4, 2);
      ctx.fillRect(Math.round(cx - scrollW / 2 + 2), Math.round(scrollY + 13), scrollW - 6, 2);
    }
    if (lift > 0.7) {
      drawSpark(
        ctx,
        cx,
        scrollY - 6,
        4 + lift * 2,
        loot === "resume" ? "#ffd080" : "#78ffc8",
        lift,
      );
    }
  }
  if (openT > 0.15) {
    ctx.fillStyle = `rgba(212,175,55,${(openT * 0.35).toFixed(3)})`;
    ctx.fillRect(x + 8, drawY - size + 4, size - 16, 6);
  }
  drawProp(surface, sprite, cx, drawY, 1);
  if (openT > 0.1) {
    const lidH = Math.round(size * 0.22 * openT);
    ctx.fillStyle = "#8a5838";
    ctx.fillRect(x + 2, drawY - size - lidH, size - 4, lidH);
  }
  if (active && openT < 0.25) {
    drawTapMeHint(ctx, cx, drawY - size, time, cx);
  }
}
function drawVaultSet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gy: number,
  local: number,
  time: number,
): void {
  const fade = clamp01((local - 0.02) / 0.12);
  const platformW = Math.round(width * 0.78);
  const platformX = Math.round(width * 0.1);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(platformX, gy - 6, platformW, 6);
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(platformX, gy - 6, platformW, 2);
  const archX = Math.round(width * 0.5);
  for (const side of [-1, 1]) {
    const tx = archX + side * Math.round(width * 0.36);
    glowCircle(ctx, tx, gy - height * 0.42, 5, "255,200,120");
    ctx.fillStyle = "#4a3828";
    ctx.fillRect(tx - 2, gy - height * 0.38, 4, Math.round(height * 0.36));
  }
  const dust = 0.2 + local * 0.35;
  for (let i = 0; i < 8; i += 1) {
    const px = (i * 53 + time * 0.015) % width;
    const py = gy - height * 0.35 + ((i * 19) % Math.max(1, height * 0.25));
    ctx.fillStyle = `rgba(255,220,160,${(dust * 0.2).toFixed(3)})`;
    ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
  }
  ctx.restore();
}
function chapterProgress(local: number, start = 0.06, end = 0.92): number {
  return clamp01((local - start) / (end - start));
}
function rnd(seed: number): number {
  const x = Math.sin(seed * 91.7) * 43758.5453;
  return x - Math.floor(x);
}
function drawLedge(
  surface: RenderContext["surface"],
  x0: number,
  ledgeY: number,
  width: number,
  gy: number,
  palette: {
    buildings: string;
  },
  plate?: Sprite,
): void {
  const ledgeW = Math.round(width - x0);
  const ledgeH = Math.round(gy - ledgeY);
  if (plate) {
    drawPropBox(surface, plate, x0 + ledgeW / 2, ledgeY, ledgeW, ledgeH);
    return;
  }
  const ctx = surface.ctx;
  ctx.fillStyle = palette.buildings;
  ctx.fillRect(Math.round(x0), Math.round(ledgeY), ledgeW, ledgeH);
  ctx.fillStyle = "#b58a52";
  ctx.fillRect(Math.round(x0), Math.round(ledgeY), ledgeW, 6);
}
export function createChapters(data: ChapterData): ChapterScene[] {
  return [
    {
      id: "intro",
      title: "Where it began",
      weight: 3.2,
      draw(rc: RenderContext) {
        const { surface, character, width, height, local, time } = rc;
        const ctx = surface.ctx;
        const gy = groundY(height);
        const scale = characterScale(height);
        const ledgeY = Math.round(gy - height * 0.2);
        const ladderX = width * 0.62;
        const stairSteps = 4;
        const stairX0 = ladderX;
        const stairX1 = width * 0.76;
        const stepW = (stairX1 - stairX0) / stairSteps;
        const stepTopY = (i: number): number => lerp(gy, ledgeY, i / stairSteps);
        const plate = prop(data, "work/bridge-girder");
        const paintStairs = (alpha = 1): void => {
          if (alpha <= 0.01) return;
          const ctx2 = surface.ctx;
          ctx2.save();
          ctx2.globalAlpha = alpha;
          if (plate) {
            for (let i = 0; i < stairSteps; i += 1) {
              const topY = stepTopY(i + 1);
              const stepCx = stairX0 + (i + 0.5) * stepW;
              drawPropBox(surface, plate, stepCx, topY, stepW + 2, gy - topY);
            }
            drawLedge(surface, stairX1, ledgeY, width, gy, PALETTES.dawn, plate);
            ctx2.restore();
            return;
          }
          for (let i = 0; i < stairSteps; i += 1) {
            const topY = stepTopY(i + 1);
            ctx2.fillStyle = PALETTES.dawn.buildings;
            ctx2.fillRect(
              Math.round(stairX0 + i * stepW),
              Math.round(topY),
              Math.ceil(stepW) + 1,
              Math.round(gy - topY) + 24,
            );
            ctx2.fillStyle = "#b58a52";
            ctx2.fillRect(
              Math.round(stairX0 + i * stepW),
              Math.round(topY),
              Math.ceil(stepW) + 1,
              4,
            );
          }
          drawLedge(surface, stairX1, ledgeY, width, gy, PALETTES.dawn);
          ctx2.restore();
        };
        const growth = clamp01((local - 0.06) / 0.62);
        const introEmphasis = clamp01(1 - local / 0.55);
        const starGlow = local < 0.35 ? 0 : clamp01(1 - local * 1.1);
        drawCityscape(
          surface,
          local * 1100,
          PALETTES.dawn,
          starGlow,
          growth,
          time,
          sceneAssets(data, "intro"),
          cityscapeOpts("intro", { intro: introEmphasis, particleScale: 0.3 }),
        );
        const homeX = mapRange(local, 0, 0.22, width * 0.34, -width * 0.25);
        const house = prop(data, "intro/childhood-house");
        const houseFade = clamp01((local - 0.06) / 0.08);
        if (local < 0.22 && local > 0.06 && homeX > -width * 0.3 && house && houseFade > 0) {
          const ctx2 = surface.ctx;
          ctx2.save();
          ctx2.globalAlpha = houseFade;
          drawProp(surface, house, homeX, gy, 1);
          ctx2.restore();
        }
        if (local > 0.32) {
          glowCircle(
            ctx,
            width * 0.7,
            mapRange(local, 0.32, 1, gy * 0.72, gy * 0.32),
            Math.max(10, height * 0.08),
            "255,224,170",
          );
        }
        if (local > 0.04) {
          applyTint(surface, PALETTES.dawn.tint);
        }
        let cx = width * 0.5;
        let baseline = gy;
        let clip: ClipName = "idle";
        let frame = 0;
        if (local < 0.08) {
          cx = width * 0.66;
          baseline = gy - height * 0.14;
          const ledgeW = 72;
          const ledgeH = Math.round(gy - baseline);
          if (plate) {
            drawPropBox(surface, plate, cx, baseline, ledgeW, ledgeH);
          } else {
            ctx.fillStyle = PALETTES.dawn.buildings;
            ctx.fillRect(Math.round(cx - ledgeW / 2), Math.round(baseline), ledgeW, ledgeH);
            ctx.fillStyle = "#c89868";
            ctx.fillRect(Math.round(cx - ledgeW / 2), Math.round(baseline), ledgeW, 4);
          }
        } else if (local < 0.18) {
          cx = width * 0.66;
          baseline = gy - height * 0.14;
          const ledgeW = 72;
          const ledgeH = Math.round(gy - baseline);
          if (plate) {
            drawPropBox(surface, plate, cx, baseline, ledgeW, ledgeH);
          } else {
            ctx.fillStyle = PALETTES.dawn.buildings;
            ctx.fillRect(Math.round(cx - ledgeW / 2), Math.round(baseline), ledgeW, ledgeH);
            ctx.fillStyle = "#c89868";
            ctx.fillRect(Math.round(cx - ledgeW / 2), Math.round(baseline), ledgeW, 4);
          }
        } else if (local < 0.28) {
          const t = clamp01((local - 0.08) / 0.2);
          cx = lerp(width * 0.5, width * 0.43, t);
          clip = "walk";
          frame = loopFrame(t, 6, 5);
        } else if (local < 0.46) {
          const t = clamp01((local - 0.28) / 0.18);
          const pit = prop(data, "intro/road-pit");
          if (pit) drawProp(surface, pit, width * 0.55, gy, 1);
          if (t < 0.4) {
            clip = "run";
            frame = loopFrame(t / 0.4, 4, 4);
            cx = lerp(width * 0.43, width * 0.49, t / 0.4);
          } else {
            const jt = clamp01((t - 0.4) / 0.6);
            clip = "jump";
            frame = oneShotFrame(jt, 6);
            cx = lerp(width * 0.49, ladderX, jt);
            baseline = gy - Math.sin(jt * Math.PI) * height * 0.24;
          }
        } else if (local < 0.62) {
          const t = clamp01((local - 0.46) / 0.16);
          paintStairs(clamp01((local - 0.44) / 0.06));
          const f = t * stairSteps;
          const si = Math.min(stairSteps - 1, Math.floor(f));
          const sf = clamp01(f - si);
          clip = "climb";
          frame = loopFrame(sf, 6, 2);
          cx = lerp(stairX0 + (si + 0.5) * stepW, stairX0 + (si + 1.5) * stepW, smoothstep(sf));
          baseline = lerp(stepTopY(si), stepTopY(si + 1), sf);
        } else if (local < 0.84) {
          const t = clamp01((local - 0.62) / 0.22);
          paintStairs(1);
          cx = lerp(stairX1 + stepW * 0.3, width * 0.88, t);
          clip = t > 0.04 && t < 0.96 ? "walk" : "idle";
          frame = loopFrame(t, 6, 4);
          baseline = ledgeY;
        } else {
          const t = clamp01((local - 0.84) / 0.16);
          paintStairs(1);
          cx = width * 0.88;
          baseline = ledgeY - Math.sin(t * Math.PI) * height * 0.03;
        }
        character.draw(surface, {
          x: cx,
          baseline,
          scale,
          clip,
          frame,
          dir: "east",
          bob: charBob(clip, time),
        });
        if (local < 0.12) drawTapHint(ctx, cx, gy, time);
      },
    },
    {
      id: "work",
      title: "Building the bridge",
      weight: 3.8,
      draw(rc: RenderContext) {
        const { surface, character, width, height, local, time } = rc;
        const ctx = surface.ctx;
        const gy = groundY(height);
        drawCityscape(
          surface,
          200,
          PALETTES.depot,
          0,
          1,
          time,
          sceneAssets(data, "work"),
          cityscapeOpts("work"),
        );
        const workBuilding = prop(data, "work/work-building");
        if (workBuilding) drawProp(surface, workBuilding, width * 0.78, gy, 1.2);
        const crane = prop(data, "work/construction-crane");
        if (crane) drawProp(surface, crane, width * 0.14 + 40, gy, 1);
        applyTint(surface, PALETTES.depot.tint);
        const n = Math.max(1, data.projectCount);
        const buildT = workChapterBuildT(local);
        const gapLeft = width * 0.3;
        const gapRight = width * 0.94;
        const deckY = Math.round(gy - height * 0.16);
        const segW = (gapRight - gapLeft) / n;
        ctx.fillStyle = PALETTES.depot.buildings;
        ctx.fillRect(0, deckY, Math.round(gapLeft), height - deckY);
        ctx.fillRect(Math.round(gapRight), deckY, width - Math.round(gapRight), height - deckY);
        ctx.fillStyle = "#b58a52";
        ctx.fillRect(0, deckY, Math.round(gapLeft), 6);
        ctx.fillRect(Math.round(gapRight), deckY, width - Math.round(gapRight), 6);
        const cur = Math.min(n - 1, Math.floor(buildT * n));
        const girder = prop(data, "work/bridge-girder");
        const crate = prop(data, "work/wooden-crate");
        const workOpen = data.getWorkOpen?.() ?? new Map();
        for (let i = 0; i < n; i += 1) {
          const t = clamp01((buildT - i / n) / (1 / n));
          if (t <= 0) continue;
          const x = gapLeft + i * segW;
          const rise = (1 - t) * (height * 0.55);
          if (girder) {
            drawProp(surface, girder, x + segW / 2, deckY + rise + 12, Math.max(0.8, segW / 64));
          } else {
            ctx.fillStyle = t >= 1 ? "#b58a52" : "#7a5e3a";
            ctx.fillRect(Math.round(x), Math.round(deckY + rise), Math.ceil(segW) + 1, 8);
          }
          if (t > 0 && t < 1) {
            ctx.fillStyle = "#ffe08a";
            for (let s = 0; s < 4; s += 1) {
              const sx = x + segW * 0.5 + (rnd(i * 7 + s) - 0.5) * segW * 0.6;
              const sy = deckY + rise - 2 - rnd(i * 13 + s) * 8;
              ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
            }
          }
          if (t > 0.45) {
            drawMysteryBox(
              surface,
              x + segW / 2,
              deckY + rise,
              Math.min(segW * 0.5, height * 0.16),
              t,
              time,
              i,
              crate,
              workOpen.get(i) ?? 0,
            );
          }
        }
        const done = clamp01((buildT - (n - 1) / n) / (1 / n));
        const flagX = Math.round(gapRight + (width - gapRight) * 0.4);
        const flagH = Math.round(height * 0.12 * done);
        ctx.fillStyle = "#2a2230";
        ctx.fillRect(flagX, deckY - flagH, 3, flagH);
        if (done > 0.5) {
          ctx.fillStyle = "#22d3ee";
          ctx.fillRect(flagX + 3, deckY - flagH, Math.round(width * 0.03), 8);
        }
        const segT = buildT * n - cur;
        const building = buildT < 0.98 && segT > 0.02 && segT < 0.98;
        const hop =
          buildT > 0.94 ? Math.sin(((buildT - 0.94) / 0.06) * Math.PI) * (height * 0.07) : 0;
        const charX = gapLeft - width * 0.05;
        character.draw(surface, {
          x: charX,
          baseline: deckY - hop,
          scale: characterScale(height),
          clip: building ? "pull" : "idle",
          frame: loopFrame(buildT, 6, n),
          dir: "east",
          bob: charBob(building ? "pull" : "idle", time),
        });
        surface.setCameraFocusX(workCameraFocusX({ buildT, gapLeft, n, segW }, width));
      },
    },
    {
      id: "skills",
      title: "The gauntlet",
      weight: 3.6,
      draw(rc: RenderContext) {
        const { surface, character, width, height, local, time } = rc;
        const ctx = surface.ctx;
        const gy = groundY(height);
        drawCityscape(
          surface,
          120 + local * 280,
          PALETTES.arena,
          1,
          1,
          time,
          sceneAssets(data, "skills"),
          cityscapeOpts("skills"),
        );
        const metro = prop(data, "skills/metro-sign");
        if (metro) drawProp(surface, metro, width * 0.88, gy, 1);
        applyTint(surface, PALETTES.arena.tint);
        const skills = data.skills;
        const n = Math.max(1, skills.length);
        const buildT = chapterProgress(local, 0.04, 0.96);
        const idx = Math.min(n - 1, Math.floor(buildT * n));
        const t = clamp01(buildT * n - idx);
        const skill = skills[idx];
        const accent = skill ? categoryColor(skill.category) : "#a5b4fc";
        const pathStart = width * 0.14;
        const pathEnd = width * 0.86;
        const spacing = n > 1 ? (pathEnd - pathStart) / (n - 1) : 0;
        const pedestalH = Math.round(height * 0.1);
        for (let i = 0; i < n; i += 1) {
          const px = n === 1 ? width * 0.5 : pathStart + i * spacing;
          const sliceT = clamp01(buildT * n - i);
          const isActive = i === idx;
          const fade =
            clamp01(sliceT * 4) * clamp01(Math.min(sliceT / 0.05, (1 - sliceT + 1) / 0.08));
          if (sliceT <= 0) continue;
          ctx.save();
          ctx.globalAlpha = fade;
          const pedW = Math.round(width * 0.08);
          const pedTop = gy - pedestalH;
          ctx.fillStyle = isActive ? accent : "#2a2438";
          ctx.fillRect(Math.round(px - pedW / 2), pedTop, pedW, pedestalH);
          ctx.fillStyle = isActive ? "#fff8e8" : "#4a4458";
          ctx.fillRect(Math.round(px - pedW / 2), pedTop, pedW, 3);
          if (sliceT > 0.08) {
            const bob = isActive ? Math.sin(time / 300 + i) * 2 : 0;
            const badgeSize = Math.round(height * 0.11);
            const skillItem = skills[i];
            if (skillItem) {
              drawSkillBadge(
                ctx,
                skillItem.id,
                px,
                pedTop - badgeSize / 2 - 4 - bob,
                badgeSize,
                fade,
                isActive,
              );
            }
            if (isActive && t > 0.5) {
              glowCircle(ctx, px, pedTop - badgeSize - 8, 8 + t * 6, "180,220,255");
            }
          }
          if (isActive && skill) {
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = "#000";
            ctx.fillText(skill.label.slice(0, 12), px + 1, pedTop - 38);
            ctx.fillStyle = accent;
            ctx.fillText(skill.label.slice(0, 12), px, pedTop - 39);
            ctx.textAlign = "left";
          }
          ctx.restore();
        }
        const charX =
          n === 1
            ? width * 0.5
            : lerp(pathStart + idx * spacing, pathStart + Math.min(n - 1, idx + 1) * spacing, t);
        const approaching = t < 0.35;
        const mastered = clamp01((t - 0.75) / 0.25);
        const clip: ClipName = mastered > 0 ? "jump" : approaching ? "walk" : "idle";
        const scale = characterScale(height);
        const baseline = gy - (mastered > 0 ? Math.sin(mastered * Math.PI) * height * 0.06 : 0);
        character.draw(surface, {
          x: charX,
          baseline,
          scale,
          clip,
          frame: approaching
            ? loopFrame(t, 6, 4)
            : mastered > 0
              ? oneShotFrame(mastered, 9)
              : loopFrame(buildT, 6, n),
          dir: "east",
          bob: mastered > 0 ? -Math.sin(mastered * Math.PI) * 4 : charBob(clip, time),
        });
        if (mastered > 0 && skill) {
          drawSpark(ctx, charX + 20, baseline - scale * 40, 4 + mastered * 3, accent, mastered);
        }
      },
    },
    {
      id: "writing",
      title: "The vault",
      weight: 2,
      draw(rc: RenderContext) {
        const { surface, character, width, height, local, time } = rc;
        const ctx = surface.ctx;
        const gy = groundY(height);
        drawCityscape(
          surface,
          80 + local * 160,
          PALETTES.vault,
          0.6,
          1,
          time,
          sceneAssets(data, "writing"),
          cityscapeOpts("writing"),
        );
        const bookshelf = prop(data, "writing/bookshelf");
        const shelfFade = clamp01((local - 0.02) / 0.14);
        if (bookshelf && shelfFade > 0) {
          ctx.save();
          ctx.globalAlpha = shelfFade;
          drawProp(surface, bookshelf, width * 0.5, gy, 1.25);
          ctx.restore();
        }
        drawVaultSet(ctx, width, height, gy, local, time);
        applyTint(surface, PALETTES.vault.tint);
        const vault = vaultLayout(local, data.postCount, width, height);
        const { postN, totalSlots, rowX0, spacing, resumeOpen, buildT } = vault;
        const postIdx = postN > 0 ? Math.min(postN - 1, Math.floor(buildT * postN)) : 0;
        const activeSlot = postN > 0 ? postIdx + 1 : 0;
        const t = postN > 0 ? clamp01(buildT * postN - postIdx) : 0;
        const openT = smoothstep(clamp01((t - 0.15) / 0.55));
        const chest = prop(data, "writing/treasure-chest");
        for (let slot = 0; slot < totalSlots; slot += 1) {
          const cx = rowX0 + spacing * (slot + 0.5);
          if (slot === 0) {
            if (chest && resumeOpen > 0.02) {
              glowCircle(ctx, cx, gy - 28, 10 + resumeOpen * 12, "255,200,100");
              drawChestProp(surface, chest, cx, gy, resumeOpen, time, resumeOpen > 0.2, "resume");
              const scrollY = gy - 48 - 6 - clamp01((resumeOpen - 0.35) / 0.65) * 22;
              if (resumeOpen > 0.4) {
                drawTapPointer(
                  ctx,
                  cx,
                  scrollY,
                  time,
                  clamp01((resumeOpen - 0.4) / 0.35),
                  "TAP ME",
                );
              }
            }
            continue;
          }
          const i = slot - 1;
          const sliceT = clamp01(buildT * postN - i);
          const isActive = i === postIdx;
          const thisOpen = isActive ? openT : sliceT >= 1 ? 1 : sliceT > 0.85 ? 0.35 : 0;
          if (chest && sliceT > 0.05) {
            drawChestProp(surface, chest, cx, gy, thisOpen, time, isActive);
          }
          if (sliceT > 0.02 && sliceT < 1) {
            ctx.fillStyle = `rgba(120,255,200,${(0.15 + sliceT * 0.2).toFixed(3)})`;
            ctx.fillRect(Math.round(cx - spacing * 0.35), gy - 4, Math.round(spacing * 0.7), 3);
          }
        }
        const scale = characterScale(height);
        const travel = vaultCharacterTravel(buildT, postN, vault);
        const { charX, cameraX, walking, walkT } = travel;
        const atResume = travel.fromSlot === 0 && walkT < 0.2;
        const pullClip: ClipName =
          atResume && resumeOpen < 0.5
            ? "pull"
            : walking
              ? "walk"
              : activeSlot > 0 && openT > 0.35
                ? "idle"
                : atResume
                  ? "idle"
                  : "walk";
        character.draw(surface, {
          x: charX,
          baseline: gy,
          scale,
          clip: pullClip,
          frame: walking
            ? loopFrame(walkT, 6, 3)
            : activeSlot === 0
              ? loopFrame(resumeOpen, 6, 4)
              : loopFrame(t, 6, 3),
          dir: "east",
          bob: charBob(pullClip, time),
        });
        surface.setCameraFocusX(cameraX);
      },
    },
    {
      id: "contact",
      title: "Rooftop at dusk",
      weight: 3.2,
      draw(rc: RenderContext) {
        const { surface, character, width, height, local, time } = rc;
        const ctx = surface.ctx;
        const gy = groundY(height);
        drawCityscape(
          surface,
          240 + local * 80,
          PALETTES.rooftop,
          1,
          1,
          time,
          sceneAssets(data, "contact"),
          cityscapeOpts("contact"),
        );
        glowCircle(ctx, width * 0.74, gy * 0.34, Math.max(8, height * 0.06), "255,246,224");
        const metaT = clamp01((local - 0.38) / 0.58);
        if (local < 0.42) {
          const cafeFade = clamp01((local - 0.08) / 0.12) * clamp01(1 - metaT * 6);
          const cafe = prop(data, "contact/rooftop-cafe");
          if (cafe && cafeFade > 0) {
            ctx.save();
            ctx.globalAlpha = cafeFade;
            drawProp(surface, cafe, width * 0.62, gy, 1.1);
            ctx.restore();
          }
        }
        applyTint(surface, PALETTES.rooftop.tint);
        const arriving = local < 0.34;
        const scale = characterScale(height);
        const contactClip = arriving ? "walk" : "idle";
        if (metaT < 0.12) {
          character.draw(surface, {
            x: mapRange(local, 0, 0.34, width * 0.2, width * 0.55, true),
            baseline: groundY(height),
            scale,
            clip: contactClip,
            frame: loopFrame(local, 6, 4),
            dir: "east",
            bob: charBob(contactClip, time),
          });
        }
      },
    },
  ];
}
