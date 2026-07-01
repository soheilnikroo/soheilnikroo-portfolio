#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const MANIFEST = JSON.parse(readFileSync(join(__dirname, "asset-manifest.json"), "utf8"));
const MCP_URL = "https://api.pixellab.ai/mcp";
const JOBS_FILE = join(__dirname, ".generation-jobs.json");
const token = process.env.PIXELLAB_API_TOKEN;
if (!token) {
  console.error("Set PIXELLAB_API_TOKEN (from https://pixellab.ai/vibe-coding)");
  process.exit(1);
}
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
  if (!existsSync(JOBS_FILE)) return { queued: [], characterId: MANIFEST.characterId };
  return JSON.parse(readFileSync(JOBS_FILE, "utf8"));
}
function saveJobs(jobs) {
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}
async function checkBalance() {
  const text = await callTool("get_balance", {});
  console.log("Balance:", text.replace(/\n/g, " | "));
  if (text.includes("generations_remaining: 0") && text.includes("credits: $0.00")) {
    console.error("\nNo generations or credits remaining. Upgrade at https://pixellab.ai/pricing");
    return false;
  }
  return true;
}
async function queueAssets() {
  const jobs = loadJobs();
  let baseTileId = null;
  console.log("\n--- Character ---");
  if (MANIFEST.character.reuseExisting && MANIFEST.characterId) {
    console.log(`Reusing character ${MANIFEST.characterId} (${MANIFEST.character.existingName})`);
    jobs.characterId = MANIFEST.characterId;
  } else {
    const spec = MANIFEST.character.futureSideView;
    const text = await callTool("create_character", spec);
    console.log(text);
    const match = text.match(/id:\s*([0-9a-f-]{36})/i);
    if (match) jobs.characterId = match[1];
  }
  if (jobs.characterId) {
    for (const anim of MANIFEST.character.animations) {
      try {
        const text = await callTool("animate_character", {
          character_id: jobs.characterId,
          template_animation_id: anim.template,
          animation_name: anim.name,
        });
        console.log(`Animation ${anim.name}:`, text.split("\n")[0]);
      } catch (e) {
        console.warn(`Animation ${anim.name} skipped:`, e.message);
      }
    }
  }
  console.log("\n--- Background parallax layers ---");
  for (const layer of MANIFEST.backgroundLayers ?? []) {
    try {
      const text = await callTool("create_map_object", {
        description: layer.description,
        width: layer.width,
        height: layer.height,
        view: "side",
        outline: MANIFEST.style.outline,
        shading: MANIFEST.style.shading,
        detail: MANIFEST.style.detail,
      });
      const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
      jobs.queued.push({
        type: "map_object",
        chapterId: "scenes",
        objectId: layer.id,
        jobId: idMatch?.[1],
        status: "processing",
        queuedAt: new Date().toISOString(),
      });
      console.log(`  layer ${layer.id}:`, text.split("\n")[0]);
    } catch (e) {
      console.warn(`  layer ${layer.id} failed:`, e.message);
    }
  }
  console.log("\n--- Landmark sprites ---");
  for (const lm of MANIFEST.landmarks ?? []) {
    try {
      const text = await callTool("create_map_object", {
        description: lm.description,
        width: lm.width,
        height: lm.height,
        view: "side",
        outline: MANIFEST.style.outline,
        shading: MANIFEST.style.shading,
        detail: MANIFEST.style.detail,
      });
      const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
      jobs.queued.push({
        type: "map_object",
        chapterId: "landmarks",
        objectId: lm.id,
        jobId: idMatch?.[1],
        status: "processing",
        queuedAt: new Date().toISOString(),
      });
      console.log(`  landmark ${lm.id}:`, text.split("\n")[0]);
    } catch (e) {
      console.warn(`  landmark ${lm.id} failed:`, e.message);
    }
  }
  console.log("\n--- Chapter props ---");
  for (const prop of MANIFEST.chapterProps ?? []) {
    try {
      const text = await callTool("create_map_object", {
        description: prop.description,
        width: prop.width,
        height: prop.height,
        view: prop.view ?? "side",
        outline: MANIFEST.style.outline,
        shading: MANIFEST.style.shading,
        detail: MANIFEST.style.detail,
      });
      const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
      jobs.queued.push({
        type: "map_object",
        chapterId: prop.chapterId,
        objectId: prop.id,
        jobId: idMatch?.[1],
        status: "processing",
        queuedAt: new Date().toISOString(),
      });
      console.log(`  prop ${prop.id}:`, text.split("\n")[0]);
    } catch (e) {
      console.warn(`  prop ${prop.id} failed:`, e.message);
    }
  }
  console.log("\n--- Scene objects & tilesets ---");
  for (const chapter of MANIFEST.chapters) {
    console.log(`\nChapter: ${chapter.title} (${chapter.id})`);
    for (const obj of chapter.sceneObjects) {
      try {
        const text = await callTool("create_map_object", {
          description: obj.description,
          width: obj.width,
          height: obj.height,
          view: obj.view ?? "side",
          outline: MANIFEST.style.outline,
          shading: MANIFEST.style.shading,
          detail: MANIFEST.style.detail,
        });
        const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
        jobs.queued.push({
          type: "map_object",
          chapterId: chapter.id,
          objectId: obj.id,
          jobId: idMatch?.[1],
          status: "processing",
          queuedAt: new Date().toISOString(),
        });
        console.log(`  object ${obj.id}:`, text.split("\n")[0]);
      } catch (e) {
        console.warn(`  object ${obj.id} failed:`, e.message);
      }
    }
    if (chapter.sidescrollerTileset) {
      try {
        const args = {
          ...chapter.sidescrollerTileset,
          tile_size: MANIFEST.style.tileSize,
          outline: MANIFEST.style.outline,
          shading: MANIFEST.style.shading,
          detail: MANIFEST.style.detail,
        };
        if (baseTileId) args.base_tile_id = baseTileId;
        const text = await callTool("create_sidescroller_tileset", args);
        const idMatch = text.match(/id:\s*([0-9a-f-]{36})/i);
        const baseMatch = text.match(/base_tile_id:\s*([0-9a-f-]{36})/i);
        if (baseMatch) baseTileId = baseMatch[1];
        jobs.queued.push({
          type: "sidescroller_tileset",
          chapterId: chapter.id,
          jobId: idMatch?.[1],
          status: "processing",
          queuedAt: new Date().toISOString(),
        });
        console.log(`  tileset:`, text.split("\n").slice(0, 2).join(" "));
      } catch (e) {
        console.warn(`  tileset failed:`, e.message);
      }
    }
  }
  saveJobs(jobs);
  console.log(`\nJobs saved to ${JOBS_FILE}`);
  console.log("Run with --poll to check status, --download when complete.");
}
async function pollJobs() {
  const jobs = loadJobs();
  let allDone = true;
  for (const job of jobs.queued) {
    if (job.status === "completed") continue;
    const tool = job.type === "map_object" ? "get_map_object" : "get_sidescroller_tileset";
    const argKey = job.type === "map_object" ? "object_id" : "tileset_id";
    try {
      const text = await callTool(tool, { [argKey]: job.jobId });
      const line = text.split("\n")[0];
      console.log(`${job.chapterId}/${job.objectId ?? "tileset"}: ${line}`);
      if (line.includes("status: completed")) job.status = "completed";
      else if (line.includes("status: failed")) job.status = "failed";
      else allDone = false;
    } catch (e) {
      console.warn(`${job.jobId}:`, e.message);
      allDone = false;
    }
  }
  saveJobs(jobs);
  return allDone;
}
async function downloadCharacter() {
  const jobs = loadJobs();
  const id = jobs.characterId ?? MANIFEST.characterId;
  if (!id) return;
  const url = `https://api.pixellab.ai/mcp/characters/${id}/download`;
  const outDir = join(ROOT, "art-bible", "pixellab-exports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `character-${id}.zip`);
  console.log(`Downloading character bundle to ${outPath}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log("Done. Unzip and copy east/west frames into public/world/character/");
}
async function main() {
  const args = process.argv.slice(2);
  console.log("PixelLab portfolio asset generator");
  console.log("Manifest:", MANIFEST.project);
  if (!args.includes("--skip-balance")) {
    const ok = await checkBalance();
    if (!ok && !args.includes("--force")) process.exit(1);
  }
  if (args.includes("--poll")) {
    const done = await pollJobs();
    console.log(done ? "\nAll jobs complete." : "\nStill processing — retry in 2-5 min.");
    return;
  }
  if (args.includes("--download")) {
    await downloadCharacter();
    return;
  }
  await queueAssets();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
