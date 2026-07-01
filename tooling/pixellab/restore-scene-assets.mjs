#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const JOBS_FILE = join(__dirname, ".scene-jobs.json");
const token = process.env.PIXELLAB_API_TOKEN;
if (!token) {
  console.error("Set PIXELLAB_API_TOKEN");
  process.exit(1);
}
const LEGACY_SCENES = [
  ["public/world/scenes/alborz-mountains.png", "c0270f79-74aa-47db-8b1b-6f57e0fbc36e"],
  ["public/world/scenes/tehran-buildings-mid.png", "fc745119-6bd2-47b8-91ad-c3686fd69a57"],
  ["public/world/scenes/milad-tower.png", "8428ac1a-e001-4a90-9715-e8ad96079486"],
  ["public/world/objects/intro/childhood-house.png", "157e7f1a-88f1-4ab6-8691-47ce136505a5"],
];
async function downloadMapObject(destRel, jobId) {
  const dest = join(ROOT, destRel);
  const url = `https://api.pixellab.ai/mcp/map-objects/${jobId}/download`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    console.warn("FAIL", destRel, res.status);
    return false;
  }
  mkdirSync(dirname(dest), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log("restored", destRel, buf.length, "bytes");
  return true;
}
async function downloadTileset(destRel, jobId) {
  const dest = join(ROOT, destRel);
  const res = await fetch("https://api.pixellab.ai/mcp", {
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
      params: { name: "get_sidescroller_tileset", arguments: { tileset_id: jobId } },
    }),
  });
  const text = await res.text();
  const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
  if (!dataLine) {
    console.warn("FAIL tileset MCP", destRel);
    return false;
  }
  const payload = JSON.parse(dataLine.slice(6));
  const content = payload.result?.content?.find((c) => c.type === "text")?.text ?? "";
  const downloadUrl =
    content.match(/download_png:\s*(https:\/\/[^\s]+)/)?.[1] ??
    content.match(/https:\/\/api\.pixellab\.ai\/mcp\/[^\s]+/)?.[0];
  if (!downloadUrl) {
    console.warn("FAIL tileset URL", destRel);
    return false;
  }
  const pngRes = await fetch(downloadUrl);
  if (!pngRes.ok) {
    console.warn("FAIL tileset download", destRel, pngRes.status);
    return false;
  }
  mkdirSync(dirname(dest), { recursive: true });
  const buf = Buffer.from(await pngRes.arrayBuffer());
  writeFileSync(dest, buf);
  console.log("restored", destRel, buf.length, "bytes");
  return true;
}
const seen = new Set();
if (existsSync(JOBS_FILE)) {
  const jobs = JSON.parse(readFileSync(JOBS_FILE, "utf8"));
  for (const job of jobs) {
    if (!job.jobId || !job.dest || job.failed) continue;
    const rel = job.dest.replace(ROOT + "/", "");
    if (seen.has(rel)) continue;
    seen.add(rel);
    if (rel.endsWith("tehran-ground-tiles.png")) continue;
    if (job.type === "sidescroller_tileset") {
      await downloadTileset(rel, job.jobId);
    } else {
      await downloadMapObject(rel, job.jobId);
    }
  }
}
for (const [rel, id] of LEGACY_SCENES) {
  if (seen.has(rel)) continue;
  await downloadMapObject(rel, id);
}
