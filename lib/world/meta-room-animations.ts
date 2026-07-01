import * as THREE from "three";

const ANIMATED_NODES = ["Plant", "Hour", "Minute"] as const;
export interface ObjectPose {
  readonly position: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly scale: THREE.Vector3;
}
type EmissiveMode = "keyboard" | "led";
interface EmissivePulse {
  readonly material: THREE.MeshStandardMaterial;
  readonly mode: EmissiveMode;
  readonly phase: number;
}
export interface RoomAnimationBindings {
  readonly nodes: Readonly<Record<string, THREE.Object3D | null>>;
  readonly poses: ReadonlyMap<THREE.Object3D, ObjectPose>;
  readonly emissives: readonly EmissivePulse[];
}
const EMISSIVE_NODES: ReadonlyArray<{
  name: string;
  mode: EmissiveMode;
}> = [
  { name: "keyboard keys", mode: "keyboard" },
  { name: "ChargerStand", mode: "led" },
];
function collectEmissives(room: THREE.Object3D): EmissivePulse[] {
  const out: EmissivePulse[] = [];
  EMISSIVE_NODES.forEach((entry, i) => {
    const node = room.getObjectByName(entry.name);
    if (!node) return;
    node.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material;
      if (Array.isArray(mat)) return;
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      const cloned = mat.clone();
      cloned.emissive = new THREE.Color("#000000");
      cloned.emissiveIntensity = 0;
      child.material = cloned;
      out.push({ material: cloned, mode: entry.mode, phase: i * 1.7 });
    });
  });
  return out;
}
export function bindRoomAnimations(room: THREE.Object3D): RoomAnimationBindings {
  const nodes: Record<string, THREE.Object3D | null> = {};
  const poses = new Map<THREE.Object3D, ObjectPose>();
  for (const name of ANIMATED_NODES) {
    const obj = room.getObjectByName(name);
    nodes[name] = obj ?? null;
    if (!obj) continue;
    poses.set(obj, {
      position: obj.position.clone(),
      quaternion: obj.quaternion.clone(),
      scale: obj.scale.clone(),
    });
  }
  return { nodes, poses, emissives: collectEmissives(room) };
}
function tickEmissives(
  emissives: readonly EmissivePulse[],
  elapsed: number,
  reducedMotion: boolean,
): void {
  for (const e of emissives) {
    if (e.mode === "keyboard") {
      const breathe = reducedMotion ? 0.12 : 0.1 + Math.sin(elapsed * 0.9 + e.phase) * 0.03;
      e.material.emissive.setRGB(0.16, 0.55, 0.78);
      e.material.emissiveIntensity = breathe;
    } else {
      const blink = reducedMotion ? 0.18 : Math.sin(elapsed * 2.4 + e.phase) > 0.6 ? 0.3 : 0.08;
      e.material.emissive.setRGB(0.2, 0.95, 0.45);
      e.material.emissiveIntensity = blink;
    }
  }
}
function poseOf(bindings: RoomAnimationBindings, name: string): ObjectPose | null {
  const obj = bindings.nodes[name];
  if (!obj) return null;
  return bindings.poses.get(obj) ?? null;
}
function resetPose(obj: THREE.Object3D, pose: ObjectPose): void {
  obj.position.copy(pose.position);
  obj.quaternion.copy(pose.quaternion);
  obj.scale.copy(pose.scale);
}
export function tickRoomAnimations(
  bindings: RoomAnimationBindings,
  elapsed: number,
  reducedMotion: boolean,
): void {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2;
  const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2;
  const hour = bindings.nodes.Hour;
  const minute = bindings.nodes.Minute;
  if (hour) hour.rotation.z = -hourAngle;
  if (minute) minute.rotation.z = -minuteAngle;
  tickEmissives(bindings.emissives, elapsed, reducedMotion);
  if (reducedMotion) return;
  const plant = bindings.nodes.Plant;
  const plantPose = poseOf(bindings, "Plant");
  if (plant && plantPose) {
    resetPose(plant, plantPose);
    plant.rotateZ(Math.sin(elapsed * 0.45) * 0.012);
  }
}
