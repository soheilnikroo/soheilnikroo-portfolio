"use client";

import * as THREE from "three";

/** Ensure Three is initialized before @react-three/fiber evaluates. */
void THREE.REVISION;

export { THREE };
