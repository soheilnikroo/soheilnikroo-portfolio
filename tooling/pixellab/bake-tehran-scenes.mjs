#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const SCENES = join(ROOT, "public/world/scenes");
const OBJECTS = join(ROOT, "public/world/objects");
const TILESETS = join(ROOT, "public/world/tilesets");
const C = {
  firoozeh: "#1c9aaa",
  firoozehDark: "#0d6b78",
  lajvard: "#1c3f95",
  terracotta: "#b74d35",
  brick: "#8a4a38",
  brickDark: "#5c3028",
  mesi: "#b87333",
  berenji: "#d4af37",
  cream: "#e8dcc8",
  smog: "#c4a882",
  smogLight: "#dcc9a8",
  alborz: "#4a5568",
  alborzSnow: "#eef2f8",
  chenar: "#2d4a30",
  chenarDark: "#1a3020",
  roof: "#6a5850",
  tank: "#8090a0",
  night: "#0a0c14",
  metroRed: "#c83030",
  taxiYellow: "#f2c200",
};
function rand(seed) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
function hexRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function setPx(buf, w, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  if (a < 255 && buf[i + 3] > 0) {
    const t = a / 255;
    buf[i] = Math.round(buf[i] * (1 - t) + r * t);
    buf[i + 1] = Math.round(buf[i + 1] * (1 - t) + g * t);
    buf[i + 2] = Math.round(buf[i + 2] * (1 - t) + b * t);
    buf[i + 3] = Math.max(buf[i + 3], a);
  } else {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  }
}
function fillRect(buf, w, h, x0, y0, rw, rh, color, alpha = 255) {
  const [r, g, b] = hexRgb(color);
  for (let y = y0; y < y0 + rh && y < h; y += 1) {
    for (let x = x0; x < x0 + rw && x < w; x += 1) {
      if (x >= 0 && y >= 0) setPx(buf, w, x, y, r, g, b, alpha);
    }
  }
}
function drawOutline(buf, w, h, x0, y0, rw, rh, color = "#000000") {
  const [r, g, b] = hexRgb(color);
  for (let x = x0; x < x0 + rw; x += 1) {
    if (x >= 0 && x < w) {
      if (y0 >= 0 && y0 < h) setPx(buf, w, x, y0, r, g, b);
      if (y0 + rh - 1 >= 0 && y0 + rh - 1 < h) setPx(buf, w, x, y0 + rh - 1, r, g, b);
    }
  }
  for (let y = y0; y < y0 + rh; y += 1) {
    if (y >= 0 && y < h) {
      if (x0 >= 0 && x0 < w) setPx(buf, w, x0, y, r, g, b);
      if (x0 + rw - 1 >= 0 && x0 + rw - 1 < w) setPx(buf, w, x0 + rw - 1, y, r, g, b);
    }
  }
}
function writePng(path, w, h, rgba) {
  const rowSize = w * 4 + 1;
  const raw = Buffer.alloc(rowSize * h);
  for (let y = 0; y < h; y += 1) {
    raw[y * rowSize] = 0;
    rgba.copy(raw, y * rowSize + 1, y * w * 4, (y + 1) * w * 4);
  }
  const compressed = deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };
  writeFileSync(
    path,
    Buffer.concat([
      signature,
      chunk("IHDR", ihdr),
      chunk("IDAT", compressed),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function bakeMountains(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const gy = h - 4;
  for (let x = 0; x < w; x += 1) {
    const ridge =
      gy -
      Math.floor(
        22 + Math.sin(x / 90) * 10 + Math.sin(x / 37 + 1.2) * 6 + rand(Math.floor(x / 20)) * 8,
      );
    for (let y = Math.max(0, ridge); y < h; y += 1) {
      const t = (y - ridge) / Math.max(1, h - ridge);
      const col = t < 0.08 ? C.alborzSnow : t < 0.28 ? "#5a6478" : "#4a5068";
      setPx(buf, w, x, y, ...hexRgb(col));
    }
    const dx = Math.abs(x - w * 0.4);
    if (dx < 36) {
      const peak = gy - 72 + (dx * dx) / 14;
      for (let y = Math.floor(peak); y < gy - 16; y += 1) {
        setPx(buf, w, x, y, ...hexRgb(y < peak + 10 ? C.alborzSnow : "#5a6478"));
      }
    }
  }
  for (let y = gy - 18; y < gy - 6; y += 1) {
    const a = Math.floor(((y - (gy - 18)) / 12) * 100);
    for (let x = 0; x < w; x += 1) setPx(buf, w, x, y, ...hexRgb(C.smogLight), a);
  }
  return buf;
}
function bakeSkylineFar(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 2;
  const blocks = [
    [0, 18],
    [96, 24],
    [200, 14],
    [320, 28],
    [420, 16],
  ];
  for (const [bx, bh] of blocks) {
    fillRect(buf, w, h, bx + 2, gy - bh, 72, bh, "#6a5858");
    fillRect(buf, w, h, bx + 2, gy - bh - 2, 72, 2, C.brickDark);
    if (rand(bx) > 0.4) fillRect(buf, w, h, bx + 48, gy - bh - 8, 6, 6, C.tank);
  }
  return buf;
}
function bakeBuildingsMid(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 4;
  const facades = [
    [24, 64],
    [180, 88],
    [340, 56],
  ];
  for (const [fx, fh] of facades) {
    fillRect(buf, w, h, fx, gy - fh, 88, fh, C.brick);
    fillRect(buf, w, h, fx, gy - fh + 8, 88, 3, C.firoozeh);
    for (let wy = gy - fh + 24; wy < gy - 14; wy += 18) {
      for (let wx = fx + 12; wx < fx + 72; wx += 20) {
        if (rand(wx + wy) > 0.35) fillRect(buf, w, h, wx, wy, 6, 8, C.berenji);
      }
    }
  }
  return buf;
}
function bakeShopfronts(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 6;
  fillRect(buf, w, h, 0, gy, w, h - gy, "#4a4438");
  fillRect(buf, w, h, 0, gy, w, 2, C.taxiYellow);
  fillRect(buf, w, h, 64, gy - 28, 48, 28, C.brickDark);
  fillRect(buf, w, h, 68, gy - 24, 16, 12, "#ffd890");
  fillRect(buf, w, h, 280, gy - 32, 56, 32, C.brickDark);
  fillRect(buf, w, h, 284, gy - 28, 20, 14, C.firoozeh);
  return buf;
}
function bakeGround(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  fillRect(buf, w, h, 0, 0, w, h, "#4a4438");
  for (let x = 0; x < w; x += 1) {
    for (let y = 0; y < h; y += 1) {
      if (rand(x * 17 + y * 31) > 0.65) {
        setPx(buf, w, x, y, ...hexRgb(rand(x + y) > 0.5 ? "#5a5448" : "#3a3830"));
      }
    }
  }
  fillRect(buf, w, h, 0, 0, w, 3, "#6a6058");
  fillRect(buf, w, h, 0, 3, w, 2, C.taxiYellow);
  return buf;
}
function bakeChenar(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 6;
  const trees = [64, 192];
  for (const x of trees) {
    fillRect(buf, w, h, x - 2, gy - 48, 4, 48, "#3a2818");
    for (let layer = 0; layer < 3; layer += 1) {
      const cy = gy - 52 - layer * 12;
      const rx = 12 + layer * 4;
      for (let dy = -8; dy <= 8; dy += 1) {
        for (let dx = -rx; dx <= rx; dx += 1) {
          if (dx * dx + dy * dy * 2 < rx * rx) setPx(buf, w, x + dx, cy + dy, ...hexRgb(C.chenar));
        }
      }
    }
  }
  return buf;
}
function bakeMilad(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const cx = 24;
  for (let y = 24; y < h - 6; y += 1) {
    const halfW = Math.max(2, 4 - Math.floor((y - 24) / 40));
    fillRect(buf, w, h, cx - halfW, y, halfW * 2, 1, "#b8bcc8");
  }
  fillRect(buf, w, h, cx - 14, 48, 28, 12, "#989aa8");
  for (let i = 0; i < 5; i += 1) fillRect(buf, w, h, cx - 12 + i * 5, 50, 3, 4, C.firoozeh);
  fillRect(buf, w, h, cx - 2, 16, 4, 32, "#a8acb8");
  fillRect(buf, w, h, cx - 1, 12, 2, 4, "#ff5050");
  return buf;
}
function bakeAzadi(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const bx = 16;
  const bw = 32;
  fillRect(buf, w, h, bx - 2, h - 12, bw + 4, 12, C.cream);
  fillRect(buf, w, h, bx, 32, bw, h - 44, C.cream);
  fillRect(buf, w, h, bx + 10, h - 48, 12, 28, C.night);
  for (let dy = -8; dy <= 0; dy += 1) {
    const span = Math.floor(Math.sqrt(64 - dy * dy));
    for (let dx = -span; dx <= span; dx += 1)
      setPx(buf, w, bx + 16 + dx, h - 48 + dy, ...hexRgb(C.cream));
  }
  return buf;
}
function bakeDomes(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 20, h - 12, 56, 12, C.brick);
  const cx = 48;
  const r = 18;
  for (let dy = -r; dy <= 0; dy += 1) {
    const span = Math.floor(Math.sqrt(r * r - dy * dy));
    fillRect(buf, w, h, cx - span, h - 12 + dy - r, span * 2, 1, C.firoozeh);
  }
  fillRect(buf, w, h, cx - 1, h - 12 - r - 5, 2, 5, C.berenji);
  fillRect(buf, w, h, cx + r - 2, h - 28, 3, 16, C.cream);
  return buf;
}
function bakeHouse(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 8, h - 10, 48, 10, C.cream);
  fillRect(buf, w, h, 10, 24, 44, h - 34, C.brick);
  fillRect(buf, w, h, 10, 24, 44, 3, C.firoozeh);
  fillRect(buf, w, h, 28, h - 26, 10, 14, "#3a2818");
  fillRect(buf, w, h, 16, 36, 8, 8, "#ffd890");
  fillRect(buf, w, h, 40, 14, 8, 8, C.tank);
  return buf;
}
function bakeCrane(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 36, 20, 8, h - 30, "#505868");
  fillRect(buf, w, h, 8, 28, 60, 6, C.mesi);
  fillRect(buf, w, h, 8, 28, 6, 20, C.terracotta);
  drawOutline(buf, w, h, 36, 20, 8, h - 30);
  return buf;
}
function bakeGirder(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 0, 4, w, 16, C.mesi);
  for (let x = 0; x < w; x += 8) fillRect(buf, w, h, x, 0, 4, h, "#8a6030");
  drawOutline(buf, w, h, 0, 4, w, 16);
  return buf;
}
function bakePit(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 0, 0, w, 6, "#5a5448");
  fillRect(buf, w, h, 4, 6, w - 8, h - 6, C.night);
  return buf;
}
function bakeChest(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 4, 12, 40, 24, C.brickDark);
  fillRect(buf, w, h, 4, 8, 40, 8, C.mesi);
  fillRect(buf, w, h, 20, 20, 8, 8, C.berenji);
  drawOutline(buf, w, h, 4, 8, 40, 28);
  return buf;
}
function bakeSlime(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - w / 2;
      const dy = y - h / 2 - 4;
      if ((dx * dx) / 200 + (dy * dy) / 120 < 1) setPx(buf, w, x, y, ...hexRgb(C.firoozeh));
    }
  }
  setPx(buf, w, 10, 12, 0, 0, 0);
  setPx(buf, w, 22, 12, 0, 0, 0);
  return buf;
}
function bakeMetroSign(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 4, 8, 56, 32, C.metroRed);
  fillRect(buf, w, h, 8, 14, 48, 20, "#1a1420");
  fillRect(buf, w, h, 12, 18, 16, 3, "#ffffff");
  fillRect(buf, w, h, 12, 26, 28, 3, C.berenji);
  fillRect(buf, w, h, 40, 18, 8, 12, C.firoozeh);
  drawOutline(buf, w, h, 4, 8, 56, 32);
  return buf;
}
function blitRgba(dest, destW, destH, src, srcW, srcH, dx, dy, alpha = 1) {
  for (let y = 0; y < srcH; y += 1) {
    const ty = dy + y;
    if (ty < 0 || ty >= destH) continue;
    for (let x = 0; x < srcW; x += 1) {
      const tx = dx + x;
      if (tx < 0 || tx >= destW) continue;
      const si = (y * srcW + x) * 4;
      const sa = src[si + 3];
      if (sa === 0) continue;
      const a = (sa / 255) * alpha;
      setPx(dest, destW, tx, ty, src[si], src[si + 1], src[si + 2], Math.round(a * 255));
    }
  }
}
function bakeIntroHero(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    const t = y / h;
    const top = hexRgb(t < 0.45 ? "#2a1848" : t < 0.72 ? "#8a4868" : "#f0b878");
    for (let x = 0; x < w; x += 1) setPx(buf, w, x, y, ...top);
  }
  const sunX = Math.round(w * 0.18);
  const sunY = Math.round(h * 0.22);
  for (let dy = -14; dy <= 14; dy += 1) {
    for (let dx = -14; dx <= 14; dx += 1) {
      if (dx * dx + dy * dy <= 196) setPx(buf, w, sunX + dx, sunY + dy, 255, 236, 190);
    }
  }
  blitRgba(buf, w, h, bakeMountains(512, 128), 512, 128, 0, h - 128, 0.92);
  blitRgba(buf, w, h, bakeSkylineFar(512, 96), 512, 96, 0, h - 96, 0.88);
  blitRgba(buf, w, h, bakeBuildingsMid(512, 160), 512, 160, 0, h - 160, 0.75);
  blitRgba(buf, w, h, bakeMilad(48, 128), 48, 128, Math.round(w * 0.72), h - 128, 0.95);
  blitRgba(buf, w, h, bakeDomes(96, 80), 96, 80, Math.round(w * 0.12), h - 80, 0.9);
  for (let y = Math.round(h * 0.58); y < Math.round(h * 0.72); y += 1) {
    const a = Math.floor(((y - h * 0.58) / (h * 0.14)) * 90);
    for (let x = 0; x < w; x += 1) setPx(buf, w, x, y, ...hexRgb(C.smogLight), a);
  }
  return buf;
}
function bakeIntroFloor(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  fillRect(buf, w, h, 0, 0, w, h, "#3a2818");
  for (let x = 0; x < w; x += 16) {
    fillRect(buf, w, h, x, 0, 15, h, x % 32 === 0 ? "#4a3420" : "#2e2014");
    fillRect(buf, w, h, x, 0, 15, 2, "#5a4030");
  }
  for (let x = 8; x < w; x += 24) {
    if (rand(x) > 0.5) setPx(buf, w, x, 4, ...hexRgb("#ffe8c0"), 40);
  }
  return buf;
}
function bakeWorkGround(w, h) {
  const buf = bakeGround(w, h);
  for (let x = 0; x < w; x += 1) {
    setPx(buf, w, x, 2, ...hexRgb(C.smogLight), 30);
  }
  return buf;
}
function bakeSkillsMetro(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  fillRect(buf, w, h, 0, 0, w, h, "#3a3848");
  for (let x = 0; x < w; x += 16) {
    for (let y = 0; y < h; y += 16) {
      fillRect(buf, w, h, x, y, 15, 15, (x / 16 + y / 16) % 2 === 0 ? "#444058" : "#363448");
    }
  }
  fillRect(buf, w, h, 0, h - 4, w, 2, C.metroRed);
  fillRect(buf, w, h, 0, h - 6, w, 2, "#f2c200");
  return buf;
}
function bakeVaultFloor(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  fillRect(buf, w, h, 0, 0, w, h, "#1a3830");
  for (let x = 0; x < w; x += 16) {
    for (let y = 0; y < h; y += 16) {
      fillRect(buf, w, h, x, y, 15, 15, (x / 16 + y / 16) % 2 === 0 ? "#245840" : "#1a3028");
      if (rand(x + y) > 0.82) setPx(buf, w, x + 4, y + 6, ...hexRgb("#3a6848"));
    }
  }
  return buf;
}
function bakeRooftopGround(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  fillRect(buf, w, h, 0, 0, w, h, "#2a2838");
  for (let x = 0; x < w; x += 12) {
    fillRect(buf, w, h, x, 0, 11, h, x % 24 === 0 ? "#343448" : "#222230");
  }
  fillRect(buf, w, h, 0, 0, w, 3, "#4a4858");
  return buf;
}
const chapterGrounds = {
  intro: bakeIntroFloor,
  work: bakeWorkGround,
  skills: bakeSkillsMetro,
  writing: bakeVaultFloor,
  contact: bakeRooftopGround,
};
const layers = [
  ["alborz-mountains", 512, 128, bakeMountains],
  ["tehran-skyline-far", 512, 96, bakeSkylineFar],
  ["tehran-buildings-mid", 512, 160, bakeBuildingsMid],
  ["tehran-shopfronts", 512, 128, bakeShopfronts],
  ["tehran-ground-tiles", 256, 32, bakeGround],
  ["chenar-trees", 256, 128, bakeChenar],
  ["milad-tower", 48, 128, bakeMilad],
  ["azadi-tower", 64, 96, bakeAzadi],
  ["persian-domes", 96, 80, bakeDomes],
];
const props = [
  ["intro", "childhood-house", 64, 56, bakeHouse],
  ["work", "construction-crane", 80, 96, bakeCrane],
  ["work", "bridge-girder", 64, 24, bakeGirder],
  ["intro", "road-pit", 48, 32, bakePit],
  ["writing", "treasure-chest", 48, 40, bakeChest],
  ["skills", "skill-slime", 32, 32, bakeSlime],
  ["skills", "metro-sign", 64, 48, bakeMetroSign],
];
mkdirSync(SCENES, { recursive: true });
const forceProcedural = process.argv.includes("--force-procedural");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice(7).split(",")) : null;
const layerIds = new Set(layers.map(([id]) => id));
const wantLayers = !only || only.has("scenes") || [...only].some((k) => layerIds.has(k));
const wantProps = !only || [...only].some((k) => props.some(([ch, id]) => `${ch}/${id}` === k));
const wantTilesets = !only || [...only].some((k) => k.startsWith("tilesets/"));
if (wantLayers) {
  if (forceProcedural || only) {
    const skipHero =
      existsSync(join(SCENES, "intro-hero-dawn.png")) && !only?.has("intro-hero-dawn");
    if (!skipHero && (!only || only.has("intro-hero-dawn"))) {
      writePng(join(SCENES, "intro-hero-dawn.png"), 512, 176, bakeIntroHero(512, 176));
      console.log("wrote scenes/intro-hero-dawn.png");
    } else if (skipHero) {
      console.log("keeping scenes/intro-hero-dawn.png (PixelLab hero preserved)");
    }
    for (const [id, w, h, fn] of layers) {
      if (only && !only.has(id)) continue;
      writePng(join(SCENES, `${id}.png`), w, h, fn(w, h));
      console.log(`wrote scenes/${id}.png`);
    }
  } else if (existsSync(join(SCENES, "intro-hero-dawn.png"))) {
    console.log(
      "Skipping scene layers — PixelLab assets present. Use --force-procedural to overwrite.",
    );
  } else {
    for (const [id, w, h, fn] of layers) {
      writePng(join(SCENES, `${id}.png`), w, h, fn(w, h));
      console.log(`wrote scenes/${id}.png (no PixelLab hero found)`);
    }
  }
}
if (forceProcedural || only) {
  if (wantProps) {
    for (const [chapter, id, w, h, fn] of props) {
      const key = `${chapter}/${id}`;
      if (only && !only.has(key)) continue;
      const dir = join(OBJECTS, chapter);
      mkdirSync(dir, { recursive: true });
      writePng(join(dir, `${id}.png`), w, h, fn(w, h));
      console.log(`wrote objects/${chapter}/${id}.png`);
    }
  }
  if (wantTilesets) {
    for (const ch of ["intro", "work", "skills", "writing", "contact"]) {
      if (only && !only.has(`tilesets/${ch}`)) continue;
      mkdirSync(join(TILESETS, ch), { recursive: true });
      const bakeFn = chapterGrounds[ch] ?? bakeGround;
      writePng(join(TILESETS, ch, "ground.png"), 256, 32, bakeFn(256, 32));
      console.log(`wrote tilesets/${ch}/ground.png`);
    }
  }
} else if (!only) {
  console.log(
    "Skipping objects/tilesets — use PixelLab assets. Pass --force-procedural to overwrite.",
  );
}
console.log("\nDone — baked Tehran scene assets with Persian palette.");
