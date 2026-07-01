import * as THREE from "three";

import { clamp01, lerp, smoothstep } from "@/lib/engine";

import type { MetaRoomAnchors } from "./meta-room-anchors";

// --- Tunables -------------------------------------------------------------
const MONITOR_FOV = 42; // close framing while the portfolio fills the screen
const ISO_FOV = 17; // long-lens isometric overview (smaller = flatter / more "isometric")
const ISO_MARGIN = 1.16; // >1 keeps the whole room comfortably inside the frame (never cropped)
const HOLD = 0.18; // fraction of the pull-back spent locked on the monitor first
const DEFAULT_ASPECT = 16 / 9;

// Iso viewing direction (azimuth + elevation), normalized below.
// Tuned to reveal the desk front, the chair and all three monitors at rest.
// Tweak X/Z for azimuth, Y for camera height.
const ISO_DIR = new THREE.Vector3(-0.82, 0.56, 0.96).normalize();

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

// Cinematic accel/decel — eases out of the monitor and settles gently into iso.
function easeInOutQuint(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
}

export interface MetaRoomCameraPose {
  readonly position: THREE.Vector3;
  readonly lookAt: THREE.Vector3;
  readonly fov: number;
}

const _monitorPos = new THREE.Vector3();
const _isoPos = new THREE.Vector3();
const _control = new THREE.Vector3();
const _termA = new THREE.Vector3();
const _termB = new THREE.Vector3();

/** Camera distance at which a (w,h) screen exactly COVERS the viewport edge-to-edge. */
function coverDistance(width: number, height: number, fovDeg: number, aspect: number): number {
  const tanV = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2);
  const distH = height / 2 / tanV;
  const distW = width / 2 / (tanV * aspect);
  // min() => the screen fully covers the frame (content bleeds to the edges).
  return Math.max(0.2, Math.min(distH, distW) * 0.99);
}

/** Camera distance that fits a sphere of `radius` inside both fov axes. */
function fitDistance(radius: number, fovDeg: number, aspect: number): number {
  const vfov = THREE.MathUtils.degToRad(fovDeg);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const limiting = Math.min(vfov, hfov);
  return (radius * ISO_MARGIN) / Math.sin(limiting / 2);
}

/** Quadratic bezier — a smooth crane arc that bows out from the monitor then settles. */
function bezier(
  out: THREE.Vector3,
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
): THREE.Vector3 {
  const u = 1 - t;
  _termA.copy(p0).multiplyScalar(u * u);
  _termB.copy(p1).multiplyScalar(2 * u * t);
  out
    .copy(p2)
    .multiplyScalar(t * t)
    .add(_termA)
    .add(_termB);
  return out;
}

/**
 * Maps zoom-out progress (0–1) to a cinematic camera pose.
 *
 * `0` — locked dead-on the curved center monitor with the portfolio covering the
 *       frame edge-to-edge (the motion *originates from the screen*).
 * `1` — a fitted isometric overview of the whole room, never cropped.
 */
export function metaRoomCameraPose(
  progress: number,
  anchors: MetaRoomAnchors,
  aspect: number = DEFAULT_ASPECT,
): MetaRoomCameraPose {
  const p = clamp01(progress);
  const screen = anchors.centerMonitor;

  // Start: dead-on the screen, framed to cover the viewport.
  const cover = coverDistance(screen.size.x, screen.size.y, MONITOR_FOV, aspect);
  _monitorPos.copy(screen.focus).addScaledVector(screen.normal, cover);

  // End: fitted isometric overview.
  const fit = fitDistance(anchors.roomRadius, ISO_FOV, aspect);
  _isoPos.copy(anchors.roomCenter).addScaledVector(ISO_DIR, fit);

  // Hold on the monitor, then ease out toward iso.
  const dolly = easeInOutQuint(clamp01((p - HOLD) / (1 - HOLD)));

  // Control point bows the path up and out from the screen for a crane feel.
  _control.copy(_monitorPos).lerp(_isoPos, 0.5);
  _control.addScaledVector(screen.normal, cover * 1.5);
  _control.y += anchors.roomRadius * 0.12;
  // Never dip below desk height — the pull-back should crane *out*, not under the floor.
  _control.y = Math.max(_control.y, screen.focus.y + screen.size.y * 0.2);

  const position = bezier(new THREE.Vector3(), _monitorPos, _control, _isoPos, dolly);

  // Never dip below desk height — the dolly stays in front of the monitor, not under the floor.
  const minY = screen.focus.y - screen.size.y * 0.1;
  position.y = Math.max(position.y, minY);
  _monitorPos.y = Math.max(_monitorPos.y, minY);

  // Subtle living drift while still holding on the monitor (parallax, never jarring).
  if (dolly < 0.001) {
    position.y += smoothstep(p / HOLD) * screen.size.y * 0.04;
  }

  const lookAt = new THREE.Vector3()
    .copy(screen.focus)
    .lerp(anchors.roomCenter, easeInOutCubic(dolly));

  const fov = lerp(MONITOR_FOV, ISO_FOV, dolly);

  return { position, lookAt, fov };
}
