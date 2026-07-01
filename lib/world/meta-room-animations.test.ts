import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { bindRoomAnimations, tickRoomAnimations } from "./meta-room-animations";

describe("tickRoomAnimations", () => {
  it("gently sways the plant without moving its position", () => {
    const room = new THREE.Group();
    const plant = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    plant.name = "Plant";
    plant.position.set(1, 2, 3);
    room.add(plant);
    const bindings = bindRoomAnimations(room);
    tickRoomAnimations(bindings, 0, false);
    const startZ = plant.quaternion.z;
    const startPos = plant.position.clone();
    tickRoomAnimations(bindings, 2.5, false);
    expect(plant.quaternion.z).not.toBeCloseTo(startZ, 4);
    expect(plant.position.distanceTo(startPos)).toBeLessThan(0.001);
  });
});
