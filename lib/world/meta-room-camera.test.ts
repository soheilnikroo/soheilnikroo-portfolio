import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { computeMetaRoomAnchors } from "./meta-room-anchors";
import { metaRoomCameraPose } from "./meta-room-camera";

describe("metaRoomCameraPose", () => {
  it("starts near the center monitor and ends on the isometric overview", () => {
    const root = new THREE.Group();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(27, 27, 27),
      new THREE.MeshStandardMaterial(),
    );
    room.name = "Room";
    room.position.set(0, 14, 0);
    root.add(room);
    const center = new THREE.Mesh(
      new THREE.BoxGeometry(6, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ name: "Material.055" }),
    );
    center.name = "wide.002";
    center.position.set(-2.3, 8.8, -10.3);
    root.add(center);
    const anchors = computeMetaRoomAnchors(root);
    const start = metaRoomCameraPose(0, anchors);
    const end = metaRoomCameraPose(1, anchors);
    expect(start.position.distanceTo(end.position)).toBeGreaterThan(10);
    expect(end.position.distanceTo(anchors.roomCenter)).toBeGreaterThan(
      start.position.distanceTo(anchors.centerMonitor.focus),
    );
    expect(end.fov).toBeLessThan(start.fov);
  });
});
