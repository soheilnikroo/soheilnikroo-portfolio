#!/usr/bin/env node
/**
 * Re-encode portfolio audio for smaller deploys while keeping MP3 + OGG pairs.
 * Music loops are trimmed to 120s (they repeat in-game). SFX are left as-is.
 *
 * Usage: node scripts/optimize-audio.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const audioRoot = join(root, "public", "audio");
const tmpRoot = join(audioRoot, ".optimize-tmp");

const MUSIC_LOOP_SECONDS = 120;
const AMBIENT_LOOP_SECONDS = 90;

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });
}

function encodePair(srcPath, outBase, { trimSeconds, mp3Bitrate, oggQ }) {
  const dir = dirname(outBase);
  mkdirSync(dir, { recursive: true });
  const trim = trimSeconds ? ["-t", String(trimSeconds)] : [];

  ffmpeg([
    "-i",
    srcPath,
    ...trim,
    "-vn",
    "-ac",
    "2",
    "-ar",
    "44100",
    "-c:a",
    "libmp3lame",
    "-b:a",
    mp3Bitrate,
    `${outBase}.mp3`,
  ]);

  ffmpeg([
    "-i",
    srcPath,
    ...trim,
    "-vn",
    "-ac",
    "2",
    "-ar",
    "44100",
    "-c:a",
    "libvorbis",
    "-q:a",
    String(oggQ),
    `${outBase}.ogg`,
  ]);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function pickSource(paths) {
  const ogg = paths.find((p) => p.endsWith(".ogg"));
  const mp3 = paths.find((p) => p.endsWith(".mp3"));
  return ogg ?? mp3;
}

rmSync(tmpRoot, { recursive: true, force: true });
mkdirSync(tmpRoot, { recursive: true });

const byStem = new Map();
for (const file of walk(audioRoot)) {
  if (file.includes(".optimize-tmp")) continue;
  const rel = file.slice(audioRoot.length + 1);
  const stem = rel.replace(/\.(ogg|mp3)$/i, "");
  if (!byStem.has(stem)) byStem.set(stem, []);
  byStem.get(stem).push(file);
}

for (const [stem, files] of byStem) {
  const src = pickSource(files);
  if (!src) continue;

  const outBase = join(tmpRoot, stem);
  const isMusic = stem.startsWith("music/");
  const isAmbient = stem.startsWith("ambient/");
  const isSfx = stem.startsWith("sfx/");

  if (isSfx) {
    // SFX are already tiny — copy without re-encoding.
    for (const file of files) {
      const rel = file.slice(audioRoot.length + 1);
      const dest = join(tmpRoot, rel);
      mkdirSync(dirname(dest), { recursive: true });
      execFileSync("cp", [file, dest]);
    }
    continue;
  }

  encodePair(src, outBase, {
    trimSeconds: isMusic ? MUSIC_LOOP_SECONDS : isAmbient ? AMBIENT_LOOP_SECONDS : undefined,
    mp3Bitrate: isMusic ? "96k" : "80k",
    oggQ: isMusic ? 4 : 3,
  });
}

for (const [stem] of byStem) {
  const relDir = dirname(stem);
  if (relDir !== ".") mkdirSync(join(audioRoot, relDir), { recursive: true });
}

for (const file of walk(tmpRoot)) {
  const rel = file.slice(tmpRoot.length + 1);
  const dest = join(audioRoot, rel);
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) rmSync(dest);
  renameSync(file, dest);
}

rmSync(tmpRoot, { recursive: true, force: true });
console.log("Audio optimized under public/audio/");
