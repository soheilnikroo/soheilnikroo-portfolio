#!/usr/bin/env node
/**
 * Regenerate minimal, cohesive Tehran assets via PixelLab MCP.
 * Falls back to procedural bake when no credits remain.
 *
 * Usage:
 *   PIXELLAB_API_TOKEN=... node tooling/pixellab/regenerate-cohesive-tehran.mjs
 *   PIXELLAB_API_TOKEN=... node tooling/pixellab/regenerate-cohesive-tehran.mjs --poll
 *   node tooling/pixellab/regenerate-cohesive-tehran.mjs --procedural-only
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const MANIFEST = JSON.parse(readFileSync(join(__dirname, "asset-manifest.json"), "utf8"));
const JOBS_FILE = join(__dirname, ".regen-jobs.json");
const MCP_URL = "https://api.pixellab.ai/mcp";
const PREFIX = MANIFEST.style.stylePrefix ?? "";
const STYLE = {
  outline: MANIFEST.style.outline,
  shading: MANIFEST.style.shading,
  detail: "low detail",
  view: "side",
};

const token = process.env.PIXELLAB_API_TOKEN;

/** Minimal assets — simple, uncrowded, one mood per chapter. Hero kept from PixelLab. */
const REGEN_TARGETS = [
  {
    type: "map_object",
    label: "scenes/alborz-mountains",
    dest: join(ROOT, "public/world/scenes/alborz-mountains.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile: soft Alborz mountain silhouettes, subtle Damavand snow peak, dusty smog band, lots of empty sky, minimal`,
      width: 512,
      height: 128,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "scenes/tehran-skyline-far",
    dest: join(ROOT, "public/world/scenes/tehran-skyline-far.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile: sparse distant Tehran flat-roof silhouettes, few water tanks, hazy atmospheric perspective, minimal not crowded`,
      width: 512,
      height: 96,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "scenes/tehran-buildings-mid",
    dest: join(ROOT, "public/world/scenes/tehran-buildings-mid.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile: only 3 Persian brick building silhouettes with turquoise frieze band, warm lit windows, wide gaps between buildings, minimal`,
      width: 512,
      height: 160,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "scenes/milad-tower",
    dest: join(ROOT, "public/world/scenes/milad-tower.png"),
    args: {
      description: `${PREFIX} Milad Tower Tehran clean silhouette, observation pod, minimal detail, side view game sprite`,
      width: 48,
      height: 128,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "scenes/azadi-tower",
    dest: join(ROOT, "public/world/scenes/azadi-tower.png"),
    args: {
      description: `${PREFIX} Azadi Tower Tehran white arched monument, simple clean silhouette, minimal detail`,
      width: 64,
      height: 96,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "scenes/persian-domes",
    dest: join(ROOT, "public/world/scenes/persian-domes.png"),
    args: {
      description: `${PREFIX} single firoozeh turquoise mosque dome with minaret, simple not crowded, side view`,
      width: 96,
      height: 80,
      ...STYLE,
    },
  },
  {
    type: "map_object",
    label: "objects/intro/childhood-house",
    dest: join(ROOT, "public/world/objects/intro/childhood-house.png"),
    args: {
      description: `${PREFIX} small Tehran neighbourhood house, flat roof, one water tank, warm dawn window glow, simple side view prop`,
      width: 64,
      height: 56,
      ...STYLE,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/intro/ground",
    dest: join(ROOT, "public/world/tilesets/intro/ground.png"),
    args: {
      lower_description: "simple dark wooden bedroom floor planks, warm dawn light",
      transition_description: "soft dust motes, minimal",
      tile_size: MANIFEST.style.tileSize,
      ...STYLE,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/work/ground",
    dest: join(ROOT, "public/world/tilesets/work/ground.png"),
    args: {
      lower_description: "simple Tehran cobblestone street, morning light",
      transition_description: "light smog mist, minimal",
      tile_size: MANIFEST.style.tileSize,
      ...STYLE,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/skills/ground",
    dest: join(ROOT, "public/world/tilesets/skills/ground.png"),
    args: {
      lower_description: "clean Tehran metro platform tiles, yellow safety line",
      transition_description: "subtle red metro stripe",
      tile_size: MANIFEST.style.tileSize,
      ...STYLE,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/writing/ground",
    dest: join(ROOT, "public/world/tilesets/writing/ground.png"),
    args: {
      lower_description: "warm stone library floor, evening light",
      transition_description: "soft amber glow, minimal",
      tile_size: MANIFEST.style.tileSize,
      ...STYLE,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/contact/ground",
    dest: join(ROOT, "public/world/tilesets/contact/ground.png"),
    args: {
      lower_description: "simple rooftop concrete tiles, night",
      transition_description: "distant city glow haze, minimal",
      tile_size: MANIFEST.style.tileSize,
      ...STYLE,
    },
  },
];

async function callTool(name, args) {
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
  if (!existsSync(JOBS_FILE)) return [];
  return JSON.parse(readFileSync(JOBS_FILE, "utf8"));
}

function saveJobs(jobs) {
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

function runProceduralBake() {
  console.log("\n→ Running minimal Tehran procedural bake...");
  execSync("node tooling/pixellab/bake-tehran-scenes.mjs --force-procedural", {
    cwd: ROOT,
    stdio: "inherit",
  });
}

async function queueRegen() {
  const jobs = loadJobs();
  const pending = new Set(jobs.filter((j) => !j.done && !j.failed).map((j) => j.label));

  for (const item of REGEN_TARGETS) {
    if (pending.has(item.label)) {
      console.log(`  skip (pending): ${item.label}`);
      continue;
    }
    try {
      const tool = item.type === "map_object" ? "create_map_object" : "create_sidescroller_tileset";
      const text = await callTool(tool, item.args);
      const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
      if (!idMatch) throw new Error(text.split("\n")[0]);
      jobs.push({
        ...item,
        jobId: idMatch[1],
        status: "processing",
        queuedAt: new Date().toISOString(),
      });
      console.log(`  ${item.label}: ${text.split("\n")[0]}`);
      await new Promise((r) => setTimeout(r, 4000));
    } catch (e) {
      console.warn(`  ${item.label} failed:`, e.message.split("\n")[0]);
    }
  }
  saveJobs(jobs);
}

async function pollAndDownload() {
  const jobs = loadJobs();
  let changed = false;

  for (const job of jobs) {
    if (job.done || job.failed || !job.jobId) continue;
    const tool = job.type === "map_object" ? "get_map_object" : "get_sidescroller_tileset";
    const argKey = job.type === "map_object" ? "object_id" : "tileset_id";

    try {
      const text = await callTool(tool, { [argKey]: job.jobId });
      const line = text.split("\n")[0];
      console.log(`${job.label}: ${line}`);

      if (line.includes("status: completed")) {
        job.done = true;
        job.status = "completed";
        changed = true;

        let downloadUrl =
          text.match(/download:\s*(https:\/\/[^\s]+)/)?.[1] ??
          text.match(/https:\/\/api\.pixellab\.ai\/mcp\/[^\s]+/)?.[0];
        if (job.type === "sidescroller_tileset") {
          downloadUrl = text.match(/download_png:\s*(https:\/\/[^\s]+)/)?.[1] ?? downloadUrl;
        }
        if (downloadUrl) {
          const res = await fetch(downloadUrl);
          if (res.ok) {
            mkdirSync(dirname(job.dest), { recursive: true });
            writeFileSync(job.dest, Buffer.from(await res.arrayBuffer()));
            console.log(`  → saved ${job.dest.replace(ROOT + "/", "")}`);
          }
        }
      } else if (line.includes("status: failed")) {
        job.failed = true;
        changed = true;
      }
    } catch (e) {
      console.warn(`${job.label}:`, e.message);
    }
  }

  if (changed) saveJobs(jobs);
  return jobs.filter((j) => !j.done && !j.failed).length === 0;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--procedural-only")) {
    runProceduralBake();
    return;
  }

  if (!token) {
    console.log("No PIXELLAB_API_TOKEN — using minimal procedural bake.");
    runProceduralBake();
    return;
  }

  const balance = await callTool("get_balance", {});
  console.log("Balance:", balance.replace(/\n/g, " | "));

  if (balance.includes("generations_remaining: 0") && balance.includes("credits: $0.00")) {
    console.log("\nNo PixelLab credits — using minimal procedural bake.");
    runProceduralBake();
    return;
  }

  if (args.includes("--poll")) {
    if (!(await pollAndDownload())) console.log("\nStill processing — retry with --poll");
    return;
  }

  console.log(`\nQueueing ${REGEN_TARGETS.length} minimal Tehran assets...`);
  await queueRegen();
  console.log("\nPolling...");
  for (let i = 0; i < 24; i += 1) {
    await new Promise((r) => setTimeout(r, 25000));
    if (await pollAndDownload()) break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
