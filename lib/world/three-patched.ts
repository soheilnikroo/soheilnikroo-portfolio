/**
 * Re-exports three.js with a warn-free Clock shim.
 * @react-three/fiber still calls `new THREE.Clock()` — alias `three` to this module
 * in next.config until r3f v10 drops Clock.
 */
export type * from "three";
// Direct bundle import bypasses the Next `three` alias (avoids circular re-export).
// @ts-expect-error — no typings for the prebuilt ESM bundle path.
export * from "../../node_modules/three/build/three.module.js";

/** Same API as THREE.Clock (r183+) without the deprecation warning. */
export class ClockCompat {
  autoStart: boolean;
  startTime: number;
  oldTime: number;
  elapsedTime: number;
  running: boolean;

  constructor(autoStart = true) {
    this.autoStart = autoStart;
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.running = false;
  }

  start() {
    this.startTime = performance.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;

    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }

    if (this.running) {
      const newTime = performance.now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }

    return diff;
  }
}

export { ClockCompat as Clock };
