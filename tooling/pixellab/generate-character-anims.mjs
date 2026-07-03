#!/usr/bin/env node
/**
 * Generate or refresh sidescroller character animations (jump + climb) via PixelLab MCP.
 *
 * Usage:
 *   PIXELLAB_API_TOKEN=... node tooling/pixellab/generate-character-anims.mjs
 *   PIXELLAB_API_TOKEN=... node tooling/pixellab/generate-character-anims.mjs --download --sync
 *   node tooling/pixellab/generate-character-anims.mjs --sync-only
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const MANIFEST = JSON.parse(readFileSync(join(__dirname, "asset-manifest.json"), "utf8"));
const MCP_URL = "https://api.pixellab.ai/mcp";
const JOBS_FILE = join(__dirname, ".generation-jobs.json");
const token = process.env.PIXELLAB_API_TOKEN;

const TARGET_ANIMS = MANIFEST.character.animations.filter((a) =>
  ["jump", "climb"].includes(a.name),
);

async function callTool(name, args) {
  if (!token) throw new Error("PIXELLAB_API_TOKEN is not set");
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const text = await res.text();
  const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
  if (!dataLine) throw new Error(`No MCP response for ${name}: ${text.slice(0, 200)}`);
  const payload = JSON.parse(dataLine.slice(6));
  const content = payload.result?.content?.find((c) => c.type === "text")?.text ?? "";
  if (content.startsWith("error:")) throw new Error(content);
  return content;
}

function loadJobs() {
  if (!existsSync(JOBS_FILE)) return { characterId: MANIFEST.characterId };
  return JSON.parse(readFileSync(JOBS_FILE, "utf8"));
}

function saveJobs(jobs) {
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

function parseBalance(text) {
  const credits = text.match(/credits:\s*\$([0-9.]+)/)?.[1] ?? "0";
  const remaining = Number(text.match(/generations_remaining:\s*(\d+)/)?.[1] ?? 0);
  const subscription = text.match(/subscription:\s*(\S+)/)?.[1] ?? "none";
  return { credits: Number(credits), remaining, subscription };
}

async function assertCanAnimate() {
  const text = await callTool("get_balance", {});
  console.log("Balance:", text.replace(/\n/g, " | "));
  const balance = parseBalance(text);
  if (balance.subscription === "none" && balance.remaining <= 0 && balance.credits <= 0) {
    console.error(`
PixelLab MCP animation requires an active subscription or credits.
  → Subscribe: https://pixellab.ai/account
  → Or sync your existing character bundle without generating:
      node tooling/pixellab/generate-character-anims.mjs --sync-only
`);
    process.exit(1);
  }
}

function findLocalExportDir(characterId) {
  const outDir = join(ROOT, "art-bible", "pixellab-exports", `character-${characterId}`);
  if (!existsSync(outDir)) return null;
  if (existsSync(join(outDir, "metadata.json"))) return outDir;
  const nested = readdirSync(outDir, { withFileTypes: true }).find((d) => d.isDirectory());
  return nested ? join(outDir, nested.name) : outDir;
}

async function queueAnimations() {
  await assertCanAnimate();
  const jobs = loadJobs();
  const characterId = jobs.characterId ?? MANIFEST.characterId;
  if (!characterId) throw new Error("No characterId in asset-manifest or .generation-jobs.json");
  jobs.characterId = characterId;
  console.log(`Character: ${characterId}`);
  let queued = 0;
  for (const anim of TARGET_ANIMS) {
    try {
      const text = await callTool("animate_character", {
        character_id: characterId,
        template_animation_id: anim.template,
        animation_name: anim.name,
        ...(anim.action_description ? { action_description: anim.action_description } : {}),
      });
      console.log(`${anim.name} (${anim.template}):`, text.split("\n")[0]);
      queued += 1;
    } catch (e) {
      console.warn(`${anim.name} failed:`, e.message);
    }
  }
  saveJobs(jobs);
  if (queued === 0) process.exit(1);
  console.log("\nAnimations queued. Wait 2–5 min, then run with --download --sync");
}

async function downloadCharacter() {
  if (!token) throw new Error("Set PIXELLAB_API_TOKEN to download from PixelLab");
  const jobs = loadJobs();
  const id = jobs.characterId ?? MANIFEST.characterId;
  const url = `https://api.pixellab.ai/mcp/characters/${id}/download`;
  const outDir = join(ROOT, "art-bible", "pixellab-exports", `character-${id}`);
  mkdirSync(outDir, { recursive: true });
  const zipPath = join(outDir, `character-${id}.zip`);
  console.log(`Downloading ${url} ...`);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  writeFileSync(zipPath, Buffer.from(await res.arrayBuffer()));
  for (const entry of readdirSync(outDir)) {
    if (entry !== `character-${id}.zip`) {
      rmSync(join(outDir, entry), { recursive: true, force: true });
    }
  }
  execSync(`unzip -o "${zipPath}" -d "${outDir}"`, { stdio: "inherit" });
  return outDir;
}

function runSync(exportDir) {
  execSync(`node "${join(__dirname, "sync-character.mjs")}" "${exportDir}"`, {
    stdio: "inherit",
    cwd: ROOT,
  });
  patchWorldContentClimb();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--sync-only")) {
    const id = loadJobs().characterId ?? MANIFEST.characterId;
    const exportDir = findLocalExportDir(id);
    if (!exportDir) {
      console.error(`No local export for character ${id}. Run with --download --sync first.`);
      process.exit(1);
    }
    console.log("Syncing local export:", exportDir);
    runSync(exportDir);
    return;
  }
  if (!token) {
    console.error("Set PIXELLAB_API_TOKEN (from https://pixellab.ai/vibe-coding)");
    process.exit(1);
  }
  if (args.includes("--download")) {
    const exportDir = await downloadCharacter();
    console.log("Exported to", exportDir);
    if (args.includes("--sync")) runSync(exportDir);
    return;
  }
  await queueAnimations();
}

function patchWorldContentClimb() {
  const climbEast = join(ROOT, "public/world/character/climb/east");
  if (!existsSync(climbEast)) return;
  const path = join(ROOT, "lib/world/world-content.ts");
  let src = readFileSync(path, "utf8");
  const frameCount = readdirSync(climbEast).filter((f) => f.endsWith(".png")).length;
  const frames = Array.from({ length: frameCount }, (_, i) => i).join(", ");
  const next = src.replace(
    /climb: dir\("run", RUN\),/,
    `climb: dir("climb", [${frames}] as const),`,
  );
  if (next !== src) {
    writeFileSync(path, next);
    console.log("Updated world-content.ts climb frame list");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
