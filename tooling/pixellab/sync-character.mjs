#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const exportArg = process.argv[2];
const EXPORT_ROOT = exportArg
  ? isAbsolute(exportArg)
    ? exportArg
    : resolve(ROOT, exportArg)
  : join(ROOT, "art-bible/pixellab-exports");
const DST = join(ROOT, "public/world/character");
const CLIP_MAP = {
  walking: "walk",
  running: "run",
  running_jump: "jump",
  front_flip: "jump",
  crouched_walking: "climb",
  animating: "idle",
};
function resolveExportDir(root) {
  if (existsSync(join(root, "rotations", "east.png"))) return root;
  const metaPath = join(root, "metadata.json");
  if (existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    const folder = meta.states?.[0]?.folder;
    if (folder) {
      const nested = isAbsolute(folder) ? folder : join(root, folder);
      if (existsSync(join(nested, "rotations", "east.png"))) return nested;
    }
  }
  const entries = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  const match = entries.find((d) => existsSync(join(root, d.name, "rotations", "east.png")));
  if (match) return join(root, match.name);
  throw new Error(`No character export found under ${root}`);
}
function findAnimDir(base, name, dir) {
  const direct = join(base, "animations", name, dir);
  if (existsSync(direct)) return direct;
  const parent = join(base, "animations", name);
  if (!existsSync(parent)) return null;
  const match = readdirSync(parent).find((d) => d === dir || d.startsWith(`${dir}-`));
  return match ? join(parent, match) : null;
}
function copyFrames(srcDir, destDir, count, prefix = "frame_") {
  if (!srcDir || !existsSync(srcDir)) return 0;
  mkdirSync(destDir, { recursive: true });
  let copied = 0;
  for (let i = 0; i < count; i += 1) {
    const pad = String(i).padStart(3, "0");
    const src = join(srcDir, `${prefix}${pad}.png`);
    if (existsSync(src)) {
      cpSync(src, join(destDir, `${i}.png`));
      copied += 1;
    }
  }
  return copied;
}
function copyClip(srcBase, exportKey, clip, dirs, count) {
  for (const dir of dirs) {
    const n = copyFrames(findAnimDir(srcBase, exportKey, dir), join(DST, clip, dir), count);
    console.log(`  ${clip}/${dir}: ${n} frames`);
  }
}
const SRC = resolveExportDir(EXPORT_ROOT);
console.log("Source:", SRC);
if (existsSync(DST)) rmSync(DST, { recursive: true, force: true });
mkdirSync(DST, { recursive: true });
cpSync(join(SRC, "rotations/east.png"), join(DST, "idle/east.png"));
cpSync(join(SRC, "rotations/west.png"), join(DST, "idle/west.png"));
const animRoot = join(SRC, "animations");
const animKeys = existsSync(animRoot) ? readdirSync(animRoot) : [];
for (const key of animKeys) {
  const clip = CLIP_MAP[key];
  if (clip) {
    const count = readdirSync(join(animRoot, key, "east")).filter((f) => f.endsWith(".png")).length;
    copyClip(SRC, key, clip, ["east", "west"], count);
  }
}
const pullKey = animKeys.find((k) => k.startsWith("animating-") && k !== "animating");
if (pullKey) {
  const count = readdirSync(join(animRoot, pullKey, "east")).filter((f) =>
    f.endsWith(".png"),
  ).length;
  copyClip(SRC, pullKey, "pull", ["east", "west"], count);
} else {
  console.warn("  pull: missing — aliasing walk");
  copyClip(SRC, "walking", "pull", ["east", "west"], 6);
}
if (!animKeys.some((k) => CLIP_MAP[k] === "climb")) {
  console.warn(
    "  climb: missing — aliasing walk (subscribe at pixellab.ai/account for crouched-walking)",
  );
  const walkEast = join(animRoot, "walking", "east");
  const count = existsSync(walkEast)
    ? readdirSync(walkEast).filter((f) => f.endsWith(".png")).length
    : 6;
  copyClip(SRC, "walking", "climb", ["east", "west"], count);
}
console.log("Synced character clips to", DST);
