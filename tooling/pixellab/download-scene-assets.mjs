#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const MANIFEST = JSON.parse(readFileSync(join(__dirname, "asset-manifest.json"), "utf8"));
const JOBS_FILE = join(__dirname, ".scene-jobs.json");
const MCP_URL = "https://api.pixellab.ai/mcp";
const token = process.env.PIXELLAB_API_TOKEN;
if (!token) {
  console.error("Set PIXELLAB_API_TOKEN");
  process.exit(1);
}
const STYLE = {
  outline: "single color outline",
  shading: MANIFEST.style.shading,
  detail: MANIFEST.style.detail,
  view: "side",
};
const DONE = new Set([
  "scenes/alborz-mountains",
  "scenes/tehran-buildings-mid",
  "scenes/tehran-skyline-far",
  "scenes/tehran-shopfronts",
  "scenes/tehran-ground-tiles",
  "scenes/chenar-trees",
  "scenes/milad-tower",
  "objects/intro/childhood-house",
]);
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
function buildQueue() {
  const queue = [];
  for (const layer of MANIFEST.backgroundLayers ?? []) {
    const key = `scenes/${layer.id}`;
    if (DONE.has(key)) continue;
    queue.push({
      type: "map_object",
      label: key,
      dest: join(ROOT, "public/world/scenes", `${layer.id}.png`),
      args: {
        description: layer.description,
        width: Math.min(layer.width, 256),
        height: Math.min(layer.height, 256),
        ...STYLE,
      },
    });
  }
  for (const lm of MANIFEST.landmarks ?? []) {
    const key = `scenes/${lm.id}`;
    if (DONE.has(key)) continue;
    queue.push({
      type: "map_object",
      label: key,
      dest: join(ROOT, "public/world/scenes", `${lm.id}.png`),
      args: {
        description: lm.description,
        width: lm.width,
        height: lm.height,
        ...STYLE,
      },
    });
  }
  for (const prop of MANIFEST.chapterProps ?? []) {
    const key = `objects/${prop.chapterId}/${prop.id}`;
    if (DONE.has(key)) continue;
    queue.push({
      type: "map_object",
      label: key,
      dest: join(ROOT, "public/world/objects", prop.chapterId, `${prop.id}.png`),
      args: {
        description: prop.description,
        width: Math.max(prop.width, 32),
        height: Math.max(prop.height, 32),
        view: prop.view ?? "side",
        outline: STYLE.outline,
        shading: STYLE.shading,
        detail: STYLE.detail,
      },
    });
  }
  for (const chapter of MANIFEST.chapters) {
    for (const obj of chapter.sceneObjects) {
      const key = `objects/${chapter.id}/${obj.id}`;
      if (DONE.has(key)) continue;
      queue.push({
        type: "map_object",
        label: key,
        dest: join(ROOT, "public/world/objects", chapter.id, `${obj.id}.png`),
        args: {
          description: obj.description,
          width: obj.width,
          height: obj.height,
          view: obj.view ?? "side",
          outline: STYLE.outline,
          shading: STYLE.shading,
          detail: STYLE.detail,
        },
      });
    }
    if (chapter.sidescrollerTileset) {
      queue.push({
        type: "sidescroller_tileset",
        label: `tilesets/${chapter.id}/ground`,
        dest: join(ROOT, "public/world/tilesets", chapter.id, "ground.png"),
        args: {
          lower_description: chapter.sidescrollerTileset.lower_description,
          transition_description: chapter.sidescrollerTileset.transition_description,
          tile_size: MANIFEST.style.tileSize,
          outline: STYLE.outline,
          shading: STYLE.shading,
          detail: STYLE.detail,
        },
      });
    }
  }
  const extraProps = [
    {
      label: "objects/skills/skill-slime",
      dest: join(ROOT, "public/world/objects/skills/skill-slime.png"),
      args: {
        description:
          "cute green pixel art slime monster, side view, game enemy, firoozeh turquoise glow, Persian palette",
        width: 32,
        height: 32,
        ...STYLE,
      },
    },
    {
      label: "objects/skills/metro-sign",
      dest: join(ROOT, "public/world/objects/skills/metro-sign.png"),
      args: {
        description:
          "Tehran metro station sign with Persian and English text, red and gold, side view pixel art",
        width: 64,
        height: 48,
        ...STYLE,
      },
    },
    {
      label: "objects/writing/treasure-chest",
      dest: join(ROOT, "public/world/objects/writing/treasure-chest.png"),
      args: {
        description:
          "wooden treasure chest with golden berenji lock, side view, slightly open with light beam, pixel art",
        width: 48,
        height: 40,
        ...STYLE,
      },
    },
  ];
  for (const item of extraProps) {
    if (!DONE.has(item.label)) queue.push({ type: "map_object", ...item });
  }
  return queue;
}
async function queueAll() {
  const existing = loadJobs();
  const pendingLabels = new Set(existing.filter((j) => !j.done).map((j) => j.label));
  const queue = buildQueue().filter((q) => !pendingLabels.has(q.label));
  console.log(`Queueing ${queue.length} assets (${existing.length} jobs on disk)...`);
  const jobs = [...existing];
  for (const item of queue) {
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
      await new Promise((r) => setTimeout(r, 8000));
    }
  }
  saveJobs(jobs);
  console.log(`\nSaved ${jobs.length} jobs to ${JOBS_FILE}`);
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
          const tilesetUrl = text.match(/download_png:\s*(https:\/\/[^\s]+)/)?.[1];
          if (tilesetUrl) downloadUrl = tilesetUrl;
        }
        if (downloadUrl) {
          const res = await fetch(downloadUrl);
          if (res.ok) {
            mkdirSync(dirname(job.dest), { recursive: true });
            writeFileSync(job.dest, Buffer.from(await res.arrayBuffer()));
            console.log(`  → saved ${job.dest.replace(ROOT + "/", "")}`);
          } else {
            console.warn(`  → download failed ${res.status}`);
          }
        }
      } else if (line.includes("status: failed")) {
        job.failed = true;
        job.status = "failed";
        changed = true;
      }
    } catch (e) {
      console.warn(`${job.label}:`, e.message);
    }
  }
  if (changed) saveJobs(jobs);
  const remaining = jobs.filter((j) => !j.done && !j.failed).length;
  console.log(
    remaining ? `\n${remaining} still processing — retry with --poll` : "\nAll jobs complete.",
  );
  return remaining === 0;
}
async function main() {
  const args = process.argv.slice(2);
  console.log("Balance:", (await callTool("get_balance", {})).replace(/\n/g, " | "));
  if (args.includes("--poll")) {
    await pollAndDownload();
    return;
  }
  await queueAll();
  console.log("\nPolling (may take several minutes)...");
  for (let i = 0; i < 30; i += 1) {
    await new Promise((r) => setTimeout(r, 25000));
    const done = await pollAndDownload();
    if (done) break;
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
