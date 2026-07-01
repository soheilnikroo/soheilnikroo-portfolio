"use client";
import "@/lib/world/three-runtime";
import { ContactShadows, Html } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { sfx, unlockAudio } from "@/lib/world/audio";
import {
  canvasToTexture,
  createSideMonitorCanvas,
  updateSideMonitorCanvas,
} from "@/lib/world/meta-monitor-textures";
import type { MetaRoomAnchors, MonitorScreenSlot } from "@/lib/world/meta-room-anchors";
import {
  computeMetaRoomAnchors,
  FALLBACK_META_ROOM_ANCHORS,
  resolveScreenNode,
  screenSurfaceFromNode,
} from "@/lib/world/meta-room-anchors";
import { bindRoomAnimations, tickRoomAnimations } from "@/lib/world/meta-room-animations";
import type { RoomAnimationBindings } from "@/lib/world/meta-room-animations";
import { metaRoomCameraPose } from "@/lib/world/meta-room-camera";

const MODEL_URL = "/3d-model/ROOM.glb";
const SOFT_SHADOWS = true;
useLoader.preload(GLTFLoader, MODEL_URL);
export interface MetaRoomSceneProps {
  readonly progress: number;
  readonly gameFrame: HTMLCanvasElement | null;
  readonly reducedMotion?: boolean;
  readonly interactive?: boolean;
  readonly onReady?: () => void;
}
const EXTERIOR_HIDDEN = [
  "CubeMini",
  "sun",
  "moon",
  "Floor",
  "mailBox",
  "Fence",
  "WelcomeCarpet",
] as const;
const SCREEN_MESH_HIDDEN = ["wide.001"] as const;
const SCREEN_INSET = 0.96;
const SCREEN_MAT = {
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 1.4,
  color: new THREE.Color(0x000000),
  roughness: 1,
  metalness: 0,
  toneMapped: false,
} as const;
function prepareScreenTexture(texture: THREE.Texture): THREE.Texture {
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}
function attachScreenPlate(
  room: THREE.Object3D,
  screen: THREE.Object3D,
  texture: THREE.Texture,
): THREE.Mesh | null {
  const surface = screenSurfaceFromNode(screen);
  if (!surface) return null;
  screen.visible = false;
  const geometry = new THREE.PlaneGeometry(
    surface.width * SCREEN_INSET,
    surface.height * SCREEN_INSET,
  );
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: SCREEN_MAT.emissive.clone(),
    emissiveIntensity: SCREEN_MAT.emissiveIntensity,
    color: SCREEN_MAT.color.clone(),
    roughness: SCREEN_MAT.roughness,
    metalness: SCREEN_MAT.metalness,
    toneMapped: SCREEN_MAT.toneMapped,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const plate = new THREE.Mesh(geometry, material);
  plate.renderOrder = 25;
  room.add(plate);
  plate.position.copy(surface.center);
  plate.quaternion.copy(surface.quaternion);
  plate.translateZ(Math.max(surface.depth * 0.35, 0.008));
  return plate;
}
function setPlateTexture(plate: THREE.Mesh, texture: THREE.Texture): void {
  const mat = plate.material;
  if (!(mat instanceof THREE.MeshStandardMaterial)) return;
  prepareScreenTexture(texture);
  mat.map = texture;
  mat.emissiveMap = texture;
  mat.needsUpdate = true;
}
const INTERACTIVE: Readonly<Record<string, string>> = {
  Chair: "The chair — still warm",
  Plant: "A little green friend 🌱",
  Robot: "beep · boop · hello 🤖",
  BelovedMacbook: "The beloved MacBook",
  CumputerCase: "The build rig — RGB and all",
  "keyboard keys": "Where the words get typed",
  mouse: "click · click · click",
  Shelf: "Books, frames & trinkets",
  BooksShelf3: "A stack of good reads",
  Frames: "Memories on the wall",
  Printer: "Still jams, occasionally",
};
interface RoomModelProps {
  readonly gameFrame: HTMLCanvasElement | null;
  readonly reducedMotion: boolean;
  readonly interactive: boolean;
  readonly onAnchors: (anchors: MetaRoomAnchors) => void;
}
interface Hovered {
  readonly name: string;
  readonly label: string;
  readonly position: THREE.Vector3;
}
interface ClickPulse {
  readonly t0: number;
  readonly base: THREE.Vector3;
}
function interactiveRoot(obj: THREE.Object3D | null): THREE.Object3D | null {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur.name && INTERACTIVE[cur.name]) return cur;
    cur = cur.parent;
  }
  return null;
}
function RoomLighting({ anchors }: { readonly anchors: MetaRoomAnchors }): React.ReactElement {
  const center = anchors.roomCenter;
  const radius = anchors.roomRadius;
  const screen = anchors.centerMonitor;
  const leftScreen = anchors.leftMonitor;
  const rightScreen = anchors.rightMonitor;
  return (
    <>
      <color attach="background" args={["#0d0a18"]} />

      <ambientLight intensity={0.62} color="#6a5a78" />
      <hemisphereLight args={["#8a7ab0", "#2a1d18", 1.0]} />

      <pointLight
        position={[center.x + radius * 0.6, center.y + radius * 0.8, center.z + radius * 0.9]}
        intensity={9}
        color="#ffb877"
        distance={radius * 4.5}
        decay={2}
      />

      <pointLight
        position={[center.x - radius * 0.85, center.y + radius * 0.45, center.z + radius * 0.5]}
        intensity={4.5}
        color="#ff9152"
        distance={radius * 3.6}
        decay={2}
      />

      <pointLight
        position={[center.x, center.y + radius * 1.1, center.z]}
        intensity={3}
        color="#ffd8b0"
        distance={radius * 4}
        decay={2}
      />

      <directionalLight
        position={[center.x - radius * 1.1, center.y + radius * 1.2, center.z - radius * 1.0]}
        intensity={0.9}
        color="#8fa3ff"
      />

      <ScreenGlow anchor={screen} intensity={4.2} radius={radius} />
      <ScreenGlow anchor={leftScreen} intensity={1.8} radius={radius} tint="#7ee0ff" />
      <ScreenGlow anchor={rightScreen} intensity={1.8} radius={radius} tint="#c4a8ff" />
    </>
  );
}
function ScreenGlow({
  anchor,
  intensity,
  radius,
  tint = "#9cc4ff",
}: {
  readonly anchor: MetaRoomAnchors["centerMonitor"];
  readonly intensity: number;
  readonly radius: number;
  readonly tint?: string;
}): React.ReactElement {
  const ref = React.useRef<THREE.PointLight>(null);
  const pos = React.useMemo(
    () => anchor.focus.clone().addScaledVector(anchor.normal, Math.max(0.3, anchor.size.y * 0.4)),
    [anchor],
  );
  useFrame((state) => {
    const l = ref.current;
    if (!l) return;
    l.intensity =
      intensity *
      (0.9 +
        Math.sin(state.clock.elapsedTime * 7.3) * 0.04 +
        Math.sin(state.clock.elapsedTime * 2.1) * 0.06);
  });
  return (
    <pointLight
      ref={ref}
      position={[pos.x, pos.y, pos.z]}
      intensity={intensity}
      color={tint}
      distance={radius * 1.9}
      decay={2}
    />
  );
}
function RoomModel({
  gameFrame,
  reducedMotion,
  interactive,
  onAnchors,
}: RoomModelProps): React.ReactElement {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const room = React.useMemo(() => gltf.scene.clone(true), [gltf]);
  const animRef = React.useRef<RoomAnimationBindings | null>(null);
  const anchorsRef = React.useRef<MetaRoomAnchors | null>(null);
  const centerPlateRef = React.useRef<THREE.Mesh | null>(null);
  const leftPlateRef = React.useRef<THREE.Mesh | null>(null);
  const rightPlateRef = React.useRef<THREE.Mesh | null>(null);
  const centerTexRef = React.useRef<THREE.CanvasTexture | null>(null);
  const leftTexRef = React.useRef<THREE.CanvasTexture | null>(null);
  const rightTexRef = React.useRef<THREE.CanvasTexture | null>(null);
  const leftCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const clickPulses = React.useRef<Map<THREE.Object3D, ClickPulse>>(new Map());
  const clockRef = React.useRef(0);
  const frameRef = React.useRef(0);
  const caseLightRef = React.useRef<THREE.PointLight>(null);
  const caseColor = React.useMemo(() => new THREE.Color(), []);
  const [hovered, setHovered] = React.useState<Hovered | null>(null);
  const [caseLightPos, setCaseLightPos] = React.useState<[number, number, number] | null>(null);
  const disposePlate = React.useCallback((plate: THREE.Mesh | null) => {
    if (!plate) return;
    plate.geometry.dispose();
    const mat = plate.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
    plate.removeFromParent();
  }, []);
  React.useLayoutEffect(() => {
    for (const name of EXTERIOR_HIDDEN) {
      const node = room.getObjectByName(name);
      if (node) node.visible = false;
    }
    for (const name of SCREEN_MESH_HIDDEN) {
      const node = room.getObjectByName(name);
      if (node) node.visible = false;
    }
    room.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true;
    });
    const pc = room.getObjectByName("CumputerCase");
    if (pc) {
      const p = new THREE.Vector3();
      pc.getWorldPosition(p);
      setCaseLightPos([p.x, p.y + 0.6, p.z + 0.4]);
    }
    animRef.current = bindRoomAnimations(room);
    const computed = computeMetaRoomAnchors(room);
    anchorsRef.current = computed;
    onAnchors(computed);
  }, [room, onAnchors]);
  const ensurePlate = React.useCallback(
    (slot: MonitorScreenSlot, texture: THREE.Texture): void => {
      const screen = resolveScreenNode(room, slot);
      if (!screen) return;
      prepareScreenTexture(texture);
      const plateRef =
        slot === "center" ? centerPlateRef : slot === "left" ? leftPlateRef : rightPlateRef;
      if (plateRef.current) {
        setPlateTexture(plateRef.current, texture);
        return;
      }
      const plate = attachScreenPlate(room, screen, texture);
      if (plate) plateRef.current = plate;
    },
    [room],
  );
  React.useEffect(() => {
    return () => {
      disposePlate(centerPlateRef.current);
      disposePlate(leftPlateRef.current);
      disposePlate(rightPlateRef.current);
      centerPlateRef.current = null;
      leftPlateRef.current = null;
      rightPlateRef.current = null;
      centerTexRef.current?.dispose();
      leftTexRef.current?.dispose();
      rightTexRef.current?.dispose();
      centerTexRef.current = null;
      leftTexRef.current = null;
      rightTexRef.current = null;
      leftCanvasRef.current = null;
      rightCanvasRef.current = null;
    };
  }, [room, disposePlate]);
  React.useLayoutEffect(() => {
    leftCanvasRef.current = createSideMonitorCanvas("code", 320, 200);
    rightCanvasRef.current = createSideMonitorCanvas("music", 300, 200);
    const lt = canvasToTexture(leftCanvasRef.current);
    const rt = canvasToTexture(rightCanvasRef.current);
    leftTexRef.current = lt;
    rightTexRef.current = rt;
    ensurePlate("left", lt);
    ensurePlate("right", rt);
  }, [room, ensurePlate]);
  React.useEffect(() => {
    centerTexRef.current?.dispose();
    let tex: THREE.CanvasTexture | null = null;
    if (gameFrame) {
      tex = canvasToTexture(gameFrame, true);
      ensurePlate("center", tex);
    }
    centerTexRef.current = tex;
    return () => {
      centerTexRef.current?.dispose();
      centerTexRef.current = null;
    };
  }, [gameFrame, room, ensurePlate]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    clockRef.current = t;
    const frame = (frameRef.current = (frameRef.current + 1) % 600);
    if (centerTexRef.current && frame % 3 === 0) centerTexRef.current.needsUpdate = true;
    if (!reducedMotion && frame % 3 === 0) {
      if (leftCanvasRef.current && leftTexRef.current) {
        updateSideMonitorCanvas(leftCanvasRef.current, "code", t * 1000);
        leftTexRef.current.needsUpdate = true;
      }
      if (rightCanvasRef.current && rightTexRef.current) {
        updateSideMonitorCanvas(rightCanvasRef.current, "music", t * 1000);
        rightTexRef.current.needsUpdate = true;
      }
    }
    if (animRef.current) tickRoomAnimations(animRef.current, t, reducedMotion);
    if (caseLightRef.current) {
      const hue = reducedMotion ? 0.58 : (t * 0.04) % 1;
      caseColor.setHSL(hue, 0.85, 0.55);
      caseLightRef.current.color.copy(caseColor);
      caseLightRef.current.intensity = reducedMotion ? 0.7 : 0.7 + Math.sin(t * 0.9) * 0.2;
    }
    if (clickPulses.current.size > 0) {
      for (const [obj, pulse] of clickPulses.current) {
        const dt = t - pulse.t0;
        if (dt >= 0.55) {
          obj.scale.copy(pulse.base);
          clickPulses.current.delete(obj);
          continue;
        }
        const k = dt / 0.55;
        const pop = Math.sin(k * Math.PI) * 0.12 * (1 - k);
        obj.scale.set(pulse.base.x * (1 + pop), pulse.base.y * (1 + pop), pulse.base.z * (1 + pop));
      }
    }
  });
  const onMove = React.useCallback(
    (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
      if (!interactive) return;
      e.stopPropagation();
      const root = interactiveRoot(e.object);
      if (!root) {
        setHovered((h) => (h ? null : h));
        if (typeof document !== "undefined") document.body.style.cursor = "";
        return;
      }
      const pos = new THREE.Vector3();
      new THREE.Box3().setFromObject(root).getCenter(pos);
      setHovered((h) =>
        h && h.name === root.name
          ? h
          : { name: root.name, label: INTERACTIVE[root.name] ?? "", position: pos },
      );
      if (typeof document !== "undefined") document.body.style.cursor = "pointer";
    },
    [interactive],
  );
  const onOut = React.useCallback(() => {
    setHovered(null);
    if (typeof document !== "undefined") document.body.style.cursor = "";
  }, []);
  const onClick = React.useCallback(
    (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
      if (!interactive) return;
      e.stopPropagation();
      const root = interactiveRoot(e.object);
      if (!root) return;
      unlockAudio();
      if (!clickPulses.current.has(root)) {
        clickPulses.current.set(root, { t0: clockRef.current, base: root.scale.clone() });
      }
      if (root.name === "Robot" || root.name === "BelovedMacbook") sfx.reveal();
      else sfx.click();
    },
    [interactive],
  );
  React.useEffect(() => {
    if (interactive) return;
    setHovered(null);
    if (typeof document !== "undefined") document.body.style.cursor = "";
  }, [interactive]);
  return (
    <>
      <primitive
        object={room}
        onPointerMove={interactive ? onMove : undefined}
        onPointerOut={interactive ? onOut : undefined}
        onPointerDown={interactive ? onClick : undefined}
      />
      {caseLightPos ? (
        <pointLight
          ref={caseLightRef}
          position={caseLightPos}
          intensity={0.8}
          distance={4.5}
          decay={2}
        />
      ) : null}
      {SOFT_SHADOWS && anchorsRef.current ? (
        <ContactShadows
          position={[
            anchorsRef.current.roomCenter.x,
            anchorsRef.current.floorY + 0.02,
            anchorsRef.current.roomCenter.z,
          ]}
          scale={anchorsRef.current.roomRadius * 2.2}
          far={anchorsRef.current.roomRadius * 0.7}
          blur={2.4}
          opacity={0.4}
          color="#000000"
          resolution={512}
          frames={reducedMotion ? 1 : 60}
        />
      ) : null}
      {interactive && hovered ? (
        <Html
          position={[hovered.position.x, hovered.position.y, hovered.position.z]}
          center
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              transform: "translateY(-150%)",
              whiteSpace: "nowrap",
              padding: "4px 10px",
              borderRadius: 3,
              border: "2px solid rgba(255,255,255,0.85)",
              background: "rgba(13,11,22,0.92)",
              color: "#fff",
              font: "600 12px var(--font-pixel, ui-monospace, monospace)",
              letterSpacing: "0.04em",
              boxShadow: "3px 3px 0 rgba(0,0,0,0.6)",
            }}
          >
            {hovered.label}
          </div>
        </Html>
      ) : null}
    </>
  );
}
function ScrollCamera({
  progress,
  reducedMotion,
  interactive,
  anchors,
}: {
  readonly progress: number;
  readonly reducedMotion: boolean;
  readonly interactive: boolean;
  readonly anchors: MetaRoomAnchors;
}): null {
  const { camera, size, pointer } = useThree();
  const lookTarget = React.useRef(new THREE.Vector3());
  const posTarget = React.useRef(new THREE.Vector3());
  useFrame(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(1, size.height);
    const pose = metaRoomCameraPose(reducedMotion ? 1 : progress, anchors, aspect);
    posTarget.current.copy(pose.position);
    if (interactive && !reducedMotion) {
      const amp = anchors.roomRadius * 0.05;
      posTarget.current.x += pointer.x * amp;
      posTarget.current.y += pointer.y * amp * 0.6;
      camera.position.lerp(posTarget.current, 0.05);
    } else {
      camera.position.copy(posTarget.current);
    }
    camera.fov = pose.fov;
    camera.updateProjectionMatrix();
    lookTarget.current.copy(pose.lookAt);
    camera.lookAt(lookTarget.current);
  });
  return null;
}
function MetaRoomCanvas({
  progress,
  gameFrame,
  reducedMotion = false,
  interactive = false,
  onReady,
}: MetaRoomSceneProps): React.ReactElement {
  const [anchors, setAnchors] = React.useState<MetaRoomAnchors>(FALLBACK_META_ROOM_ANCHORS);
  const readyRef = React.useRef(false);
  const onAnchors = React.useCallback(
    (next: MetaRoomAnchors) => {
      setAnchors(next);
      if (!readyRef.current) {
        readyRef.current = true;
        onReady?.();
      }
    },
    [onReady],
  );
  const initialPose = React.useMemo(
    () => metaRoomCameraPose(0, FALLBACK_META_ROOM_ANCHORS, 16 / 9),
    [],
  );
  const initialCam = initialPose.position;
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.35,
      }}
      camera={{
        position: [initialCam.x, initialCam.y, initialCam.z],
        fov: initialPose.fov,
        near: 0.1,
        far: 800,
      }}
    >
      <RoomLighting anchors={anchors} />
      <RoomModel
        gameFrame={gameFrame}
        reducedMotion={reducedMotion}
        interactive={interactive}
        onAnchors={onAnchors}
      />
      <ScrollCamera
        progress={progress}
        reducedMotion={reducedMotion}
        interactive={interactive}
        anchors={anchors}
      />
    </Canvas>
  );
}
export function MetaRoomScene({
  progress,
  gameFrame,
  reducedMotion = false,
  interactive = false,
  onReady,
}: MetaRoomSceneProps): React.ReactElement {
  return (
    <div
      className={`absolute inset-0 ${interactive ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden="true"
      onPointerDown={interactive ? (e) => e.stopPropagation() : undefined}
    >
      <React.Suspense fallback={null}>
        <MetaRoomCanvas
          progress={progress}
          gameFrame={gameFrame}
          reducedMotion={reducedMotion}
          interactive={interactive}
          onReady={onReady}
        />
      </React.Suspense>
    </div>
  );
}
