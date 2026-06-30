#!/usr/bin/env node
/**
 * Bake Tehran-themed pixel-art scene layers and props into public/world/.
 * Palette inspired by Persian architecture: firoozeh turquoise, mesi copper,
 * terracotta brick, berenji gold, lajvard blue, dusty smog horizons.
 *
 * By default only bakes chapter tilesets (not PixelLab scene PNGs).
 * Pass --force-procedural to overwrite public/world/scenes/ (fallback art only).
 *
 * Run: node tooling/pixellab/bake-tehran-scenes.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const SCENES = join(ROOT, "public/world/scenes");
const OBJECTS = join(ROOT, "public/world/objects");
const TILESETS = join(ROOT, "public/world/tilesets");

// Persian / Tehran palette
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

/** Simple 8×8 Persian geometric tile motif. */
function paintTileMotif(buf, w, h, x0, y0, color) {
  const [r, g, b] = hexRgb(color);
  for (let dy = 0; dy < 8; dy += 1) {
    for (let dx = 0; dx < 8; dx += 1) {
      const on = (dx === dy || dx + dy === 7 || dx === 3 || dy === 3) && (dx + dy) % 2 === 0;
      if (on) setPx(buf, w, x0 + dx, y0 + dy, r, g, b);
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

/** Alborz range + Damavand snow cap + dusty Tehran smog band at base. */
function bakeMountains(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const gy = h - 6;
  for (let x = 0; x < w; x += 1) {
    const seed = Math.floor(x / 12);
    const ridge = gy - Math.floor(28 + rand(seed) * 38 + Math.sin(x / 64) * 14);
    for (let y = ridge; y < h; y += 1) {
      const t = (y - ridge) / (h - ridge);
      const col = t < 0.12 ? C.alborzSnow : t < 0.35 ? C.alborz : "#3a4258";
      setPx(buf, w, x, y, ...hexRgb(col));
    }
    // Damavand — dominant snow cone
    const dx = Math.abs(x - w * 0.38);
    if (dx < 48) {
      const peak = gy - 100 + (dx * dx) / 18;
      for (let y = Math.floor(peak); y < gy - 22; y += 1) {
        const snowLine = peak + 14 + Math.sin(x / 3) * 2;
        setPx(buf, w, x, y, ...hexRgb(y < snowLine ? C.alborzSnow : C.alborz));
      }
    }
  }
  // Smog band — characteristic Tehran morning haze over mountains
  for (let y = gy - 28; y < gy - 8; y += 1) {
    const a = (y - (gy - 28)) / 20;
    for (let x = 0; x < w; x += 1) {
      setPx(buf, w, x, y, ...hexRgb(C.smog), Math.floor(a * 140));
    }
  }
  return buf;
}

/** Flat Tehran rooftops: water tanks, satellite dishes, low parapets. */
function bakeSkylineFar(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 2;
  const step = 28;
  for (let i = 0; i <= w / step + 1; i += 1) {
    const x = i * step;
    const seed = i;
    const bh = 14 + Math.floor(rand(seed) * 22);
    const bw = step - 2;
    fillRect(buf, w, h, x + 1, gy - bh, bw, bh, C.roof);
    // Parapet wall on flat roof
    fillRect(buf, w, h, x + 1, gy - bh - 3, bw, 3, C.brickDark);
    // Water tank (ab-khan) — iconic Tehran rooftop
    if (rand(seed * 2) > 0.35) {
      const tx = x + 4 + Math.floor(rand(seed * 3) * (bw - 10));
      fillRect(buf, w, h, tx, gy - bh - 10, 8, 8, C.tank);
      fillRect(buf, w, h, tx + 1, gy - bh - 12, 6, 2, C.tank);
    }
    // Satellite dish
    if (rand(seed * 5) > 0.55) {
      const sx = x + bw - 10;
      fillRect(buf, w, h, sx, gy - bh - 6, 2, 6, "#4a4a58");
      for (let d = -4; d <= 4; d += 1) {
        setPx(buf, w, sx + d, gy - bh - 7, ...hexRgb("#6a7080"));
      }
    }
    // Small AC unit
    if (rand(seed * 7) > 0.7) {
      fillRect(buf, w, h, x + 10, gy - bh - 5, 6, 4, "#505868");
    }
  }
  return buf;
}

/** Persian brick mid-rise facades, turquoise tile bands, mashrabiya windows. */
function bakeBuildingsMid(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 4;
  const step = 44;
  for (let i = 0; i <= w / step + 1; i += 1) {
    const x = i * step;
    const seed = i;
    const bh = 48 + Math.floor(rand(seed) * 72);
    const bw = step - 4;
    const brick = rand(seed) > 0.45 ? C.brick : C.brickDark;
    fillRect(buf, w, h, x + 2, gy - bh, bw, bh, brick);
    drawOutline(buf, w, h, x + 2, gy - bh, bw, bh, "#2a1810");
    // Turquoise tile frieze (Persian architecture)
    fillRect(buf, w, h, x + 2, gy - bh + 6, bw, 4, C.firoozeh);
    for (let tx = x + 4; tx < x + bw; tx += 8) {
      paintTileMotif(buf, w, h, tx, gy - bh + 14, C.firoozehDark);
    }
    // Lit windows — warm berenji + cool firoozeh
    const cols = Math.floor(bw / 11);
    const rows = Math.floor((bh - 24) / 14);
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        if (rand(seed + c * 7 + r * 13) > 0.5) {
          const lit = rand(seed + c + r) > 0.65 ? C.berenji : C.firoozeh;
          fillRect(buf, w, h, x + 5 + c * 11, gy - bh + 26 + r * 14, 5, 7, lit);
          fillRect(buf, w, h, x + 5 + c * 11, gy - bh + 26 + r * 14, 5, 1, "#1a1010");
        }
      }
    }
    // Shop awning (terracotta)
    if (rand(seed * 5) > 0.5) {
      fillRect(buf, w, h, x + 2, gy - 10, bw, 5, C.terracotta);
    }
  }
  return buf;
}

/** Street level: bazaar shops, metro entrance, cobblestone, taxi stripe. */
function bakeShopfronts(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 8;
  const step = 56;
  for (let i = 0; i <= w / step + 1; i += 1) {
    const x = i * step;
    const seed = i;
    const bh = 32 + Math.floor(rand(seed) * 24);
    fillRect(buf, w, h, x + 2, gy - bh, step - 4, bh, C.brickDark);
    drawOutline(buf, w, h, x + 2, gy - bh, step - 4, bh);
    // Shop window with warm interior
    fillRect(buf, w, h, x + 6, gy - bh + 10, step - 16, 16, "#1a1420");
    fillRect(buf, w, h, x + 8, gy - bh + 12, step - 20, 12, "#3a2818");
    // Persian tile above door
    for (let tx = x + 8; tx < x + step - 12; tx += 8) {
      paintTileMotif(buf, w, h, tx, gy - bh + 2, C.firoozeh);
    }
    // Tehran Metro entrance (every 3rd shop)
    if (i % 3 === 1) {
      fillRect(buf, w, h, x + step - 18, gy - bh, 14, bh, C.metroRed);
      fillRect(buf, w, h, x + step - 16, gy - bh + 8, 10, 4, "#ffffff");
      fillRect(buf, w, h, x + step - 16, gy - bh + 14, 10, 3, C.berenji);
    }
    // Terracotta awning
    fillRect(buf, w, h, x + 4, gy - bh - 4, step - 8, 4, C.terracotta);
  }
  // Sidewalk + cobblestone street
  fillRect(buf, w, h, 0, gy, w, 4, "#5a5048");
  fillRect(buf, w, h, 0, gy + 4, w, h - gy - 4, "#4a4438");
  for (let x = 0; x < w; x += 8) {
    for (let y = gy + 4; y < h; y += 8) {
      if (rand(x + y) > 0.4) setPx(buf, w, x, y, ...hexRgb(rand(x) > 0.5 ? "#3a3830" : "#524c40"));
    }
  }
  // Taxi yellow curb stripe
  fillRect(buf, w, h, 0, gy + 2, w, 2, C.taxiYellow);
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

/** Chenar plane trees lining Valiasr-style boulevard. */
function bakeChenar(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const gy = h - 6;
  const step = 72;
  for (let i = 0; i <= w / step + 1; i += 1) {
    const x = i * step + 36;
    const seed = i;
    const th = 44 + Math.floor(rand(seed) * 36);
    const trunkTop = gy - th;
    fillRect(buf, w, h, x - 2, trunkTop, 4, th, "#3a2818");
    // Patchy chenar canopy — tall, columnar habit
    for (let layer = 0; layer < 4; layer += 1) {
      const cy = trunkTop - 8 - layer * 10;
      const rx = 14 + layer * 3;
      const ry = 8 + Math.floor(rand(seed + layer) * 4);
      for (let dy = -ry; dy <= ry; dy += 1) {
        for (let dx = -rx; dx <= rx; dx += 1) {
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
            const col = rand(seed + dx + dy) > 0.3 ? C.chenar : C.chenarDark;
            setPx(buf, w, x + dx, cy + dy, ...hexRgb(col));
          }
        }
      }
    }
  }
  return buf;
}

/** Milad Tower — Tehran's iconic communications tower. */
function bakeMilad(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const cx = 24;
  // Tapered shaft
  for (let y = 18; y < h - 8; y += 1) {
    const t = (y - 18) / (h - 26);
    const halfW = Math.max(2, Math.round(4 - t * 1.5));
    fillRect(buf, w, h, cx - halfW, y, halfW * 2, 1, "#c8ccd8");
  }
  // Observation pod (hex-ish)
  fillRect(buf, w, h, cx - 16, 44, 32, 14, "#a8acb8");
  fillRect(buf, w, h, cx - 12, 40, 24, 6, "#9098a8");
  // Pod windows
  for (let i = 0; i < 6; i += 1) {
    fillRect(buf, w, h, cx - 14 + i * 5, 46, 3, 5, C.firoozeh);
  }
  // Head structure
  fillRect(buf, w, h, cx - 4, 14, 8, 28, "#b0b4c0");
  // Aviation warning light
  fillRect(buf, w, h, cx - 1, 10, 3, 5, "#ff4040");
  drawOutline(buf, w, h, cx - 16, 40, 32, 18);
  return buf;
}

/** Azadi Tower — marble monument with open arch. */
function bakeAzadi(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const bx = 14;
  const bw = 36;
  const bh = h - 18;
  // Base platform
  fillRect(buf, w, h, bx - 4, h - 14, bw + 8, 14, C.cream);
  // Main body — tapered with central arch void
  fillRect(buf, w, h, bx, 28, bw, bh - 28, C.cream);
  drawOutline(buf, w, h, bx, 28, bw, bh - 28, "#a09888");
  // Arch opening (Azadi's signature)
  fillRect(buf, w, h, bx + 12, h - 50, 12, 34, C.night);
  // Upper arch curve
  for (let dy = -10; dy <= 0; dy += 1) {
    const span = Math.floor(Math.sqrt(100 - dy * dy));
    for (let dx = -span; dx <= span; dx += 1) {
      setPx(buf, w, bx + 18 + dx, h - 50 + dy, ...hexRgb(C.cream));
      if (Math.abs(dx) === span) setPx(buf, w, bx + 18 + dx, h - 50 + dy, ...hexRgb("#a09888"));
    }
  }
  // Lattice detail lines (simplified)
  fillRect(buf, w, h, bx + 4, 36, 2, bh - 40, "#c8c0b0");
  fillRect(buf, w, h, bx + bw - 6, 36, 2, bh - 40, "#c8c0b0");
  return buf;
}

/** Mosque domes with firoozeh turquoise tiles + minarets. */
function bakeDomes(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 8, h - 14, 80, 14, C.brick);
  const domes = [
    [24, 20],
    [52, 24],
    [76, 16],
  ];
  for (const [dx, r] of domes) {
    for (let dy = -r; dy <= 0; dy += 1) {
      const span = Math.floor(Math.sqrt(r * r - dy * dy));
      const stripe = Math.floor(dy / 3) % 2 === 0 ? C.firoozeh : C.firoozehDark;
      fillRect(buf, w, h, dx - span, h - 14 + dy - r, span * 2, 1, stripe);
    }
    // Gold finial
    fillRect(buf, w, h, dx - 1, h - 14 - r - 6, 2, 6, C.berenji);
    // Minaret
    fillRect(buf, w, h, dx + r - 4, h - 36, 4, 22, C.cream);
    fillRect(buf, w, h, dx + r - 3, h - 40, 2, 5, C.berenji);
  }
  return buf;
}

/** Traditional Tehran neighbourhood house — flat roof, tank, dish. */
function bakeHouse(w, h) {
  const buf = Buffer.alloc(w * h * 4, 0);
  fillRect(buf, w, h, 6, h - 12, 52, 12, C.cream);
  fillRect(buf, w, h, 8, 22, 48, h - 34, C.brick);
  drawOutline(buf, w, h, 8, 22, 48, h - 34);
  fillRect(buf, w, h, 8, 22, 48, 4, C.firoozeh);
  // Door
  fillRect(buf, w, h, 26, h - 28, 12, 16, "#3a2818");
  // Window with warm light
  fillRect(buf, w, h, 14, 34, 10, 10, "#1a1828");
  fillRect(buf, w, h, 15, 35, 8, 8, "#d4a050");
  // Rooftop water tank
  fillRect(buf, w, h, 38, 12, 10, 10, C.tank);
  fillRect(buf, w, h, 40, 10, 6, 2, C.tank);
  // Satellite dish
  fillRect(buf, w, h, 18, 14, 2, 5, "#505860");
  for (let d = -3; d <= 3; d += 1) setPx(buf, w, 19 + d, 12, ...hexRgb("#707880"));
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
  // Stylised Persian خط M indicator + metro
  fillRect(buf, w, h, 12, 18, 16, 3, "#ffffff");
  fillRect(buf, w, h, 12, 26, 28, 3, C.berenji);
  fillRect(buf, w, h, 40, 18, 8, 12, C.firoozeh);
  drawOutline(buf, w, h, 4, 8, 56, 32);
  return buf;
}

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
      writePng(join(TILESETS, ch, "ground.png"), 256, 32, bakeGround(256, 32));
      console.log(`wrote tilesets/${ch}/ground.png`);
    }
  }
} else if (!only) {
  console.log(
    "Skipping objects/tilesets — use PixelLab assets. Pass --force-procedural to overwrite.",
  );
}

console.log("\nDone — baked Tehran scene assets with Persian palette.");
