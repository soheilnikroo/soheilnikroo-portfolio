#!/usr/bin/env node
/**
 * Regenerate weak / incoherent PixelLab assets with unified Tehran style prompts.
 * Falls back to procedural bake when no PixelLab credits remain.
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

const token = process.env.PIXELLAB_API_TOKEN;

/** Assets that broke coherence — isolated objects instead of tile strips, wrong vibe. */
const REGEN_TARGETS = [
  // intro-hero-dawn intentionally omitted — keep PixelLab panorama for landing beauty
  {
    type: "map_object",
    label: "scenes/tehran-buildings-mid",
    dest: join(ROOT, "public/world/scenes/tehran-buildings-mid.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile strip: Tehran Persian brick mid-rise facades, firoozeh turquoise tile frieze, terracotta awnings, lit windows`,
      width: 512,
      height: 160,
      view: "side",
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
    },
  },
  {
    type: "map_object",
    label: "scenes/tehran-shopfronts",
    dest: join(ROOT, "public/world/scenes/tehran-shopfronts.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile strip: Tehran bazaar shopfronts, red metro entrance, Persian tile above doors, cobblestone sidewalk, taxi yellow curb`,
      width: 512,
      height: 128,
      view: "side",
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
    },
  },
  {
    type: "map_object",
    label: "scenes/chenar-trees",
    dest: join(ROOT, "public/world/scenes/chenar-trees.png"),
    args: {
      description: `${PREFIX} seamless horizontal tile strip: Valiasr boulevard chenar plane trees, tall columnar canopies, Tehran street foreground`,
      width: 256,
      height: 128,
      view: "side",
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
    },
  },
  {
    type: "map_object",
    label: "objects/intro/childhood-house",
    dest: join(ROOT, "public/world/objects/intro/childhood-house.png"),
    args: {
      description: `${PREFIX} small Tehran neighbourhood house, flat roof, water tank ab-khan, satellite dish, firoozeh tile band, warm dawn light, full side view game prop`,
      width: 64,
      height: 56,
      view: "side",
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/intro/ground",
    dest: join(ROOT, "public/world/tilesets/intro/ground.png"),
    args: {
      lower_description: "dark wooden bedroom floor planks with faint dawn light",
      transition_description: "dust motes and warm morning glow",
      tile_size: MANIFEST.style.tileSize,
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
    },
  },
  {
    type: "sidescroller_tileset",
    label: "tilesets/skills/ground",
    dest: join(ROOT, "public/world/tilesets/skills/ground.png"),
    args: {
      lower_description: "Tehran metro platform floor tiles with yellow safety line",
      transition_description: "red metro stripe and fluorescent glow",
      tile_size: MANIFEST.style.tileSize,
      outline: MANIFEST.style.outline,
      shading: MANIFEST.style.shading,
      detail: MANIFEST.style.detail,
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
  console.log("\n→ Running procedural Tehran bake (--force-procedural)...");
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
    console.log("No PIXELLAB_API_TOKEN — using procedural Tehran bake.");
    runProceduralBake();
    return;
  }

  const balance = await callTool("get_balance", {});
  console.log("Balance:", balance.replace(/\n/g, " | "));

  if (balance.includes("generations_remaining: 0") && balance.includes("credits: $0.00")) {
    console.log("\nNo PixelLab credits — falling back to procedural Tehran bake.");
    runProceduralBake();
    return;
  }

  if (args.includes("--poll")) {
    const done = await pollAndDownload();
    if (!done) console.log("\nStill processing — retry with --poll");
    return;
  }

  console.log(`\nQueueing ${REGEN_TARGETS.length} cohesive Tehran assets...`);
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
