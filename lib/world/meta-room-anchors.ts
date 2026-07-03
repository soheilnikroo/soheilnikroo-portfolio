import * as THREE from "three";

export interface MonitorAnchor {
  readonly focus: THREE.Vector3;
  readonly normal: THREE.Vector3;
  readonly size: THREE.Vector2;
}
export interface MetaRoomAnchors {
  readonly roomCenter: THREE.Vector3;
  readonly roomRadius: number;
  readonly floorY: number;
  readonly centerMonitor: MonitorAnchor;
  readonly leftMonitor: MonitorAnchor;
  readonly rightMonitor: MonitorAnchor;
}

export const SCREEN_NODE_CANDIDATES = {
  center: ["wide002", "wide.002"],
  left: ["medium001", "medium.001"],
  right: ["small002", "small.002"],
} as const;
export type MonitorScreenSlot = keyof typeof SCREEN_NODE_CANDIDATES;
export function resolveScreenNode(
  scene: THREE.Object3D,
  slot: MonitorScreenSlot,
): THREE.Object3D | null {
  for (const name of SCREEN_NODE_CANDIDATES[slot]) {
    const node = scene.getObjectByName(name);
    if (node) return node;
  }
  return null;
}
const _box = new THREE.Box3();
const _localBox = new THREE.Box3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();
const _localSize = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _toCenter = new THREE.Vector3();
function defaultAnchor(): MonitorAnchor {
  return {
    focus: new THREE.Vector3(),
    normal: new THREE.Vector3(0, 0, 1),
    size: new THREE.Vector2(3, 2),
  };
}
function axisVector(index: number): THREE.Vector3 {
  return new THREE.Vector3(index === 0 ? 1 : 0, index === 1 ? 1 : 0, index === 2 ? 1 : 0);
}
function argMin(x: number, y: number, z: number): number {
  if (x <= y && x <= z) return 0;
  if (y <= x && y <= z) return 1;
  return 2;
}
export interface ScreenSurface {
  readonly center: THREE.Vector3;
  readonly quaternion: THREE.Quaternion;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}
const _localCenter = new THREE.Vector3();
const _worldScale = new THREE.Vector3();
export function screenSurfaceFromNode(node: THREE.Object3D): ScreenSurface | null {
  if (!(node instanceof THREE.Mesh) || !node.geometry) return null;
  const geo = node.geometry as THREE.BufferGeometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  _localBox.copy(geo.boundingBox ?? _localBox.makeEmpty());
  _localBox.getCenter(_localCenter);
  _localBox.getSize(_localSize);
  const ax = Math.abs(_localSize.x);
  const ay = Math.abs(_localSize.y);
  const az = Math.abs(_localSize.z);
  const thin = argMin(ax, ay, az);
  let width: number;
  let height: number;
  let depth: number;
  if (thin === 2) {
    width = ax;
    height = ay;
    depth = Math.max(az, 0.02);
  } else if (thin === 1) {
    width = Math.max(ax, az);
    height = Math.min(ax, az);
    depth = ay;
  } else {
    width = Math.max(ay, az);
    height = Math.min(ay, az);
    depth = ax;
  }
  node.updateWorldMatrix(true, false);
  node.matrixWorld.decompose(_center, _quat, _worldScale);
  const center = _localCenter.clone().applyMatrix4(node.matrixWorld);
  node.getWorldQuaternion(_quat);
  width *= _worldScale.x;
  height *= _worldScale.y;
  depth *= _worldScale.z;
  return { center, quaternion: _quat.clone(), width, height, depth };
}
function monitorAnchor(
  scene: THREE.Object3D,
  slot: MonitorScreenSlot,
  roomCenter: THREE.Vector3,
): MonitorAnchor {
  const node = resolveScreenNode(scene, slot);
  if (!node) return defaultAnchor();
  const surface = screenSurfaceFromNode(node);
  if (!surface) return defaultAnchor();
  const focus = surface.center.clone();
  let normal: THREE.Vector3;
  if (node instanceof THREE.Mesh && node.geometry) {
    const geo = node.geometry as THREE.BufferGeometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    _localBox.copy(geo.boundingBox ?? _localBox.makeEmpty());
    _localBox.getSize(_localSize);
    const thin = argMin(Math.abs(_localSize.x), Math.abs(_localSize.y), Math.abs(_localSize.z));
    normal = axisVector(thin).applyQuaternion(surface.quaternion).normalize();
  } else {
    normal = new THREE.Vector3(0, 0, 1);
  }
  _toCenter.copy(roomCenter).sub(focus);
  _toCenter.y = 0;
  if (_toCenter.lengthSq() > 1e-6 && normal.dot(_toCenter) < 0) normal.negate();
  const flat = new THREE.Vector3(_toCenter.x, 0, _toCenter.z);
  if (flat.lengthSq() > 1e-6) normal.copy(flat.normalize());
  else if (Math.abs(normal.y) > 0.9) normal.set(0, 0, 1);
  const width = surface.width;
  const height = surface.height;
  return {
    focus,
    normal: normal.normalize(),
    size: new THREE.Vector2(Math.max(width, 0.4), Math.max(height, 0.3)),
  };
}
export function computeMetaRoomAnchors(scene: THREE.Object3D): MetaRoomAnchors {
  scene.updateMatrixWorld(true);
  const roomMesh = scene.getObjectByName("Room");
  if (roomMesh) {
    _box.setFromObject(roomMesh);
  } else {
    _box.makeEmpty();
    scene.traverse((obj) => {
      if (obj.name === "sun" || obj.name === "moon" || obj.name === "Floor") return;
      if (obj instanceof THREE.Mesh) _box.expandByObject(obj);
    });
    if (_box.isEmpty()) _box.setFromObject(scene);
  }
  _box.getCenter(_center);
  _box.getSize(_size);
  const roomCenter = _center.clone();
  const roomRadius = 0.5 * _size.length();
  const floorY = _box.min.y;
  const centerMonitor = monitorAnchor(scene, "center", roomCenter);
  const leftMonitor = monitorAnchor(scene, "left", roomCenter);
  const rightMonitor = monitorAnchor(scene, "right", roomCenter);
  return {
    roomCenter,
    roomRadius: Math.max(roomRadius, 1),
    floorY,
    centerMonitor,
    leftMonitor,
    rightMonitor,
  };
}
export const FALLBACK_META_ROOM_ANCHORS: MetaRoomAnchors = {
  roomCenter: new THREE.Vector3(-0.36, 14.19, 0.23),
  roomRadius: 23.1,
  floorY: 0.87,
  centerMonitor: {
    focus: new THREE.Vector3(-2.27, 8.8, -10.29),
    normal: new THREE.Vector3(0, 0, 1),
    size: new THREE.Vector2(5.9, 2.27),
  },
  leftMonitor: {
    focus: new THREE.Vector3(-7.19, 8.34, -9.82),
    normal: new THREE.Vector3(0.2, 0, 0.98).normalize(),
    size: new THREE.Vector2(3.33, 1.51),
  },
  rightMonitor: {
    focus: new THREE.Vector3(1.62, 8.32, -9.83),
    normal: new THREE.Vector3(-0.2, 0, 0.98).normalize(),
    size: new THREE.Vector2(2.99, 1.47),
  },
};
