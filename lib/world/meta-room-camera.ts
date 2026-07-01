import * as THREE from "three";

import { clamp01, lerp, smoothstep } from "@/lib/engine";

import type { MetaRoomAnchors } from "./meta-room-anchors";

const MONITOR_FOV = 42;
const ISO_FOV = 17;
const ISO_MARGIN = 1.16;
const HOLD = 0.18;
const DEFAULT_ASPECT = 16 / 9;
const ISO_DIR = new THREE.Vector3(-0.82, 0.56, 0.96).normalize();
function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}
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
function coverDistance(width: number, height: number, fovDeg: number, aspect: number): number {
  const tanV = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2);
  const distH = height / 2 / tanV;
  const distW = width / 2 / (tanV * aspect);
  return Math.max(0.2, Math.min(distH, distW) * 0.99);
}
function fitDistance(radius: number, fovDeg: number, aspect: number): number {
  const vfov = THREE.MathUtils.degToRad(fovDeg);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const limiting = Math.min(vfov, hfov);
  return (radius * ISO_MARGIN) / Math.sin(limiting / 2);
}
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
export function metaRoomCameraPose(
  progress: number,
  anchors: MetaRoomAnchors,
  aspect: number = DEFAULT_ASPECT,
): MetaRoomCameraPose {
  const p = clamp01(progress);
  const screen = anchors.centerMonitor;
  const cover = coverDistance(screen.size.x, screen.size.y, MONITOR_FOV, aspect);
  _monitorPos.copy(screen.focus).addScaledVector(screen.normal, cover);
  const fit = fitDistance(anchors.roomRadius, ISO_FOV, aspect);
  _isoPos.copy(anchors.roomCenter).addScaledVector(ISO_DIR, fit);
  const dolly = easeInOutQuint(clamp01((p - HOLD) / (1 - HOLD)));
  _control.copy(_monitorPos).lerp(_isoPos, 0.5);
  _control.addScaledVector(screen.normal, cover * 1.5);
  _control.y += anchors.roomRadius * 0.12;
  _control.y = Math.max(_control.y, screen.focus.y + screen.size.y * 0.2);
  const position = bezier(new THREE.Vector3(), _monitorPos, _control, _isoPos, dolly);
  const minY = screen.focus.y - screen.size.y * 0.1;
  position.y = Math.max(position.y, minY);
  _monitorPos.y = Math.max(_monitorPos.y, minY);
  if (dolly < 0.001) {
    position.y += smoothstep(p / HOLD) * screen.size.y * 0.04;
  }
  const lookAt = new THREE.Vector3()
    .copy(screen.focus)
    .lerp(anchors.roomCenter, easeInOutCubic(dolly));
  const fov = lerp(MONITOR_FOV, ISO_FOV, dolly);
  return { position, lookAt, fov };
}
