"use client";

import { Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as React from "react";

import { useAmbient } from "@/features/ambient";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Canvas2DSurface, GameViewportRect, ScrollTimeline, Stage } from "@/lib/engine";
import type { StoryBeat } from "@/lib/schemas/world-narrative";
import { setSfxVolume, sfx, unlockAudio } from "@/lib/world/audio";
import {
  setChapterAudioMuted,
  setChapterMusicVolume,
  syncChapterMusic,
  unlockChapterAudio,
} from "@/lib/world/chapter-audio";
import { pixelFont } from "@/lib/world/pixel-font";
import { segmentBeat } from "@/lib/world/segment-beat";
import { mysteryBoxBounds, virtualToPercent, workBridgeLayout } from "@/lib/world/work-bridge";
import {
  characterManifest,
  chapterGroundTiles,
  propPaths,
  sceneManifest,
} from "@/lib/world/world-content";
import type { StoryMilestone, StoryProfile } from "@/lib/world/world-content";
import { hitResumeChest, vaultLayout } from "@/lib/world/writing-vault";

import {
  clamp01,
  chapterProgress,
  SKILLS_SCROLL_NUDGE,
  SKILL_SPOTLIGHT_COUNT,
} from "../world-helpers";
import { ChapterBlock } from "./chapter-block";
import { GameDialogueBox } from "./game-dialogue-box";
import { MetaRoomOverlay } from "./meta-room-overlay";
import { WorldSkillOverlay } from "./world-skill-overlay";

const MetaRoomScene = dynamic(
  () =>
    import("@/lib/world/three-runtime").then(() =>
      import("./meta-room-scene").then((mod) => mod.MetaRoomScene),
    ),
  { ssr: false },
);

export interface WorldProject {
  readonly slug: string;
  readonly title: string;
  readonly role: string;
  readonly year: string;
  readonly summary: string;
}
export interface WorldPost {
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly minutes: number;
}
export interface WorldSocial {
  readonly label: string;
  readonly href: string;
}
export interface WorldSkill {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  readonly level: number;
  readonly summary: string;
}

export interface WorldExperienceProps {
  readonly profileName: string;
  readonly role: string;
  readonly tagline: string;
  readonly summary: string;
  readonly location: string;
  readonly milestones: readonly StoryMilestone[];
  readonly projects: readonly WorldProject[];
  readonly skills: readonly WorldSkill[];
  readonly posts: readonly WorldPost[];
  readonly email: string;
  readonly socials: readonly WorldSocial[];
  readonly resumeUrl?: string;
  readonly introProse: string;
  readonly chapterMeta: readonly { id: string; title: string; weight: number }[];
  readonly chapterGoals: Readonly<Record<string, string>>;
  readonly storyBeats: Readonly<Record<string, readonly StoryBeat[]>>;
  readonly trackHeightVh: number;
}

export function WorldExperience(props: WorldExperienceProps) {
  const {
    profileName,
    role,
    tagline,
    summary,
    location,
    milestones,
    projects,
    skills,
    posts,
    email,
    socials,
    resumeUrl,
    chapterMeta,
    chapterGoals,
    storyBeats,
    trackHeightVh: scrollTrackHeightVh,
  } = props;
  const reduced = useReducedMotion();
  const { soundEnabled, toggleSound, volume, setBedSuppressed } = useAmbient();
  const muted = !soundEnabled;
  const [mounted, setMounted] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedSkill, setSelectedSkill] = React.useState<WorldSkill | null>(null);
  const [openedWorkBox, setOpenedWorkBox] = React.useState<number | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  const [chestLoot, setChestLoot] = React.useState<WorldPost | null>(null);
  const [chapterLocal, setChapterLocal] = React.useState(0);
  const [questLine, setQuestLine] = React.useState({ text: "", opacity: 0 });
  const [workAnimTick, setWorkAnimTick] = React.useState(0);
  const [metaSecretRevealed, setMetaSecretRevealed] = React.useState(false);
  const [metaGameFrame, setMetaGameFrame] = React.useState<HTMLCanvasElement | null>(null);

  const workOpenRef = React.useRef<Map<number, number>>(new Map());
  const metaFrameRef = React.useRef<HTMLCanvasElement | null>(null);
  const workOpenTargetRef = React.useRef<Map<number, number>>(new Map());
  const openedWorkBoxRef = React.useRef<number | null>(null);
  const lastMetaSwellRef = React.useRef(false);
  const lastResumeChestRef = React.useRef(false);
  const lastProgressRef = React.useRef(0);
  const forceRedrawRef = React.useRef<(() => void) | null>(null);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameViewportRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const captionRef = React.useRef<HTMLParagraphElement>(null);
  const blockRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const pingLayerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<GameViewportRect | null>(null);
  const roomPrefetchedRef = React.useRef(false);
  const [metaRoomReady, setMetaRoomReady] = React.useState(false);

  const contactChapterIndex = React.useMemo(
    () =>
      Math.max(
        0,
        chapterMeta.findIndex((chapter) => chapter.id === "contact"),
      ),
    [chapterMeta],
  );
  const contactChapterIndexRef = React.useRef(contactChapterIndex);
  contactChapterIndexRef.current = contactChapterIndex;

  // Warm the HTTP cache + JS chunks as soon as the experience mounts.
  React.useEffect(() => {
    if (roomPrefetchedRef.current) return;
    roomPrefetchedRef.current = true;
    void fetch("/3d-model/ROOM.glb").catch(() => {});
    void import("@/lib/engine");
    void import("@/lib/world/chapters");
    void import("@/lib/world/three-runtime").then(() => import("./meta-room-scene"));
  }, []);
  const storyProfile = React.useMemo<StoryProfile>(
    () => ({ name: profileName, role, tagline, summary, location }),
    [profileName, role, tagline, summary, location],
  );

  React.useEffect(() => {
    setMounted(true);
    const probe = document.createElement("canvas");
    if (!probe.getContext("2d")) setSupported(false);
  }, []);

  const enabled = mounted && !reduced && supported;

  React.useEffect(() => {
    setChapterAudioMuted(!soundEnabled);
    if (soundEnabled) {
      unlockAudio();
      unlockChapterAudio();
    }
  }, [soundEnabled]);

  React.useEffect(() => {
    setSfxVolume(volume);
    setChapterMusicVolume(volume);
  }, [volume]);

  React.useEffect(() => {
    setBedSuppressed(true);
    return () => setBedSuppressed(false);
  }, [setBedSuppressed]);

  React.useEffect(() => {
    openedWorkBoxRef.current = openedWorkBox;
  }, [openedWorkBox]);

  React.useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const track = trackRef.current;
    const stageEl = stageRef.current;
    if (!canvas || !track || !stageEl) return;

    let disposed = false;
    let timeline: ScrollTimeline | null = null;
    let surface: Canvas2DSurface | null = null;
    let stage: Stage | null = null;
    let resizeObs: ResizeObserver | null = null;
    let viewObs: IntersectionObserver | null = null;
    let lastProgress = 0;
    let lastRenderedP = -1;
    let lastRenderTime = 0;
    let lastIndex = -1;
    let lastSkillIdx = -1;
    let lastBeatKey = "";
    let overlayIndex = -1;
    let lastChestLootIdx = -1;
    let revealNodes: NodeListOf<HTMLElement> | null = null;
    let fadeNodes: NodeListOf<HTMLElement> | null = null;

    const syncGameViewport = (): void => {
      const vp = gameViewportRef.current;
      if (!vp || !surface) return;
      const gameVp = surface.getGameViewport();
      const { offsetX, offsetY, displayWidth, displayHeight } = gameVp;
      vp.style.left = `${offsetX}px`;
      vp.style.top = `${offsetY}px`;
      vp.style.width = `${displayWidth}px`;
      vp.style.height = `${displayHeight}px`;
      viewportRef.current = gameVp;
    };

    const sizeNow = (): void => {
      if (!surface) return;
      const rect = stageEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      surface.resize(
        Math.max(1, Math.floor(rect.width)),
        Math.max(1, Math.floor(rect.height)),
        dpr,
      );
      syncGameViewport();
      lastRenderedP = -1; // force a redraw at the new size
    };

    const revealOverlay = (index: number, local: number): void => {
      if (index !== overlayIndex) {
        overlayIndex = index;
        const block = blockRefs.current[index];
        revealNodes = block ? block.querySelectorAll<HTMLElement>("[data-reveal]") : null;
        fadeNodes = block ? block.querySelectorAll<HTMLElement>("[data-fade-out]") : null;
      }
      if (revealNodes) {
        const nReveal = revealNodes.length;
        revealNodes.forEach((item, i) => {
          const raw = item.dataset.revealAt;
          const threshold = raw !== undefined ? Number.parseFloat(raw) : NaN;
          const t = Number.isFinite(threshold)
            ? clamp01((local - threshold) / 0.14)
            : clamp01(local * nReveal - i * 0.8);
          item.style.opacity = t.toFixed(3);
          item.style.transform = `translateY(${((1 - t) * 14).toFixed(1)}px)`;
        });
      }
      if (fadeNodes) {
        fadeNodes.forEach((el) => {
          const t = clamp01(1 - local * 2.4);
          el.style.opacity = t.toFixed(3);
          el.style.transform = `translateY(${(-(1 - t) * 10).toFixed(1)}px)`;
        });
      }
      // Fade contact DOM overlay during meta desk pull-back.
      if (index === 4 && local > 0.38) {
        const block = blockRefs.current[4];
        const metaFade = block?.querySelectorAll<HTMLElement>("[data-meta-fade]");
        const metaT = clamp01((local - 0.38) / 0.12);
        metaFade?.forEach((el) => {
          el.style.opacity = (1 - metaT).toFixed(3);
          el.style.pointerEvents = metaT > 0.85 ? "none" : "";
        });
      }
    };

    const lerpWorkOpen = (): boolean => {
      let dirty = false;
      for (const [idx, current] of workOpenRef.current) {
        const target = workOpenTargetRef.current.get(idx) ?? 0;
        if (Math.abs(current - target) > 0.02) {
          workOpenRef.current.set(idx, current + (target - current) * 0.22);
          dirty = true;
        } else if (current !== target) {
          workOpenRef.current.set(idx, target);
          dirty = true;
        }
      }
      for (const [idx, target] of workOpenTargetRef.current) {
        if (!workOpenRef.current.has(idx) && target > 0) {
          workOpenRef.current.set(idx, 0.05);
          dirty = true;
        }
      }
      return dirty;
    };

    const syncWritingVault = (active: { index: number; local: number }): void => {
      if (active.index !== 3) {
        lastResumeChestRef.current = false;
        return;
      }

      const layout = vaultLayout(active.local, posts.length);
      const { resumeOpen, buildT, postN } = layout;

      if (resumeOpen > 0.4 && !lastResumeChestRef.current) {
        lastResumeChestRef.current = true;
        unlockAudio();
        sfx.boxOpen();
      } else if (resumeOpen < 0.15) {
        lastResumeChestRef.current = false;
      }

      if (postN === 0) return;

      const idx = Math.min(postN - 1, Math.floor(buildT * postN));
      const t = clamp01(buildT * postN - idx);
      const openRaw = clamp01((t - 0.15) / 0.55);
      const openT = openRaw * openRaw * (3 - 2 * openRaw);
      if (openT > 0.4) {
        if (idx !== lastChestLootIdx) {
          lastChestLootIdx = idx;
          const post = posts[idx];
          if (post) {
            setChestLoot(post);
            unlockAudio();
            sfx.boxOpen();
          }
        }
      } else if (lastChestLootIdx >= 0) {
        lastChestLootIdx = -1;
        setChestLoot(null);
      }
    };

    const onProgress = (p: number): void => {
      lastProgress = p;
      lastProgressRef.current = p;
      if (!stage) return;

      const workAnimDirty = lerpWorkOpen();
      syncWritingVault(stage.resolveActive(p));
      const now = performance.now();
      if (
        lastRenderedP >= 0 &&
        Math.abs(p - lastRenderedP) < 0.0004 &&
        now - lastRenderTime < 45 &&
        !workAnimDirty
      ) {
        return;
      }
      lastRenderTime = now;
      lastRenderedP = p;
      const active = stage.render(p);
      if (surface) viewportRef.current = surface.getGameViewport();
      setChapterLocal(active.local);
      if (active.index === lastIndex) {
        syncChapterMusic({ chapterIndex: active.index, chapterLocal: active.local });
      }
      if (workAnimDirty) setWorkAnimTick((t) => t + 1);

      // Work chapter: reset opened boxes when scrolling back before they're built.
      if (active.index === 1 && projects.length > 0) {
        const bridge = workBridgeLayout(active.local, projects.length);
        for (const span of bridge.spans) {
          if (span.builtT < 0.42) {
            workOpenTargetRef.current.delete(span.idx);
            workOpenRef.current.delete(span.idx);
            if (openedWorkBoxRef.current === span.idx) {
              openedWorkBoxRef.current = null;
              setOpenedWorkBox(null);
            }
          }
        }
      }

      // Meta swell SFX when desk POV begins.
      if (active.index === contactChapterIndexRef.current) {
        const metaT = clamp01((active.local - 0.38) / 0.58);
        if (metaT > 0.15 && !lastMetaSwellRef.current) {
          lastMetaSwellRef.current = true;
          sfx.metaSwell();
        } else if (metaT < 0.08) {
          lastMetaSwellRef.current = false;
        }
        // Feed the *live* game canvas straight into the center monitor so the
        // 2D fullscreen view and the 3D screen show the identical image — the
        // crossfade between them becomes invisible.
        if (metaT > 0.01) {
          const frame = canvasRef.current;
          if (frame && frame !== metaFrameRef.current) {
            metaFrameRef.current = frame;
            setMetaGameFrame(frame);
          }
        } else if (metaFrameRef.current) {
          metaFrameRef.current = null;
          setMetaGameFrame(null);
        }
      } else if (metaFrameRef.current) {
        metaFrameRef.current = null;
        setMetaGameFrame(null);
      }
      if (progressRef.current) progressRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (active.index !== lastIndex) {
        lastIndex = active.index;
        setActiveIndex(active.index);
        syncChapterMusic({ chapterIndex: active.index, chapterLocal: active.local });
        if (active.index !== 2) {
          setSelectedSkill(null);
          lastSkillIdx = -1;
        }
        if (active.index !== 3) {
          lastChestLootIdx = -1;
          setChestLoot(null);
        }
      }
      // Which skill station is currently active (chapter index 2).
      if (active.index === 2 && skills.length > 0) {
        const skillN = Math.min(SKILL_SPOTLIGHT_COUNT, skills.length);
        const buildT = chapterProgress(active.local, 0.04, 0.96);
        const si = Math.min(skillN - 1, Math.floor(buildT * skillN));
        if (si !== lastSkillIdx) {
          lastSkillIdx = si;
        }
      }

      if (progressRef.current) progressRef.current.style.width = `${(p * 100).toFixed(2)}%`;

      revealOverlay(active.index, active.local);

      // Narration: pick the last beat whose threshold we've passed in this chapter.
      const lines = storyBeats[active.id] ?? [];
      let bi = -1;
      for (let i = 0; i < lines.length; i += 1) {
        if (active.local >= (lines[i]?.at ?? 1)) bi = i;
      }
      const key = `${active.id}:${bi}`;
      if (key !== lastBeatKey) {
        lastBeatKey = key;
        if (captionRef.current) {
          const line = bi >= 0 ? lines[bi] : undefined;
          captionRef.current.textContent = line ? line.text : "";
          captionRef.current.style.opacity = line ? "1" : "0";
        }
        setQuestLine({
          text: bi >= 0 ? (lines[bi]?.text ?? "") : "",
          opacity: bi >= 0 ? 1 : 0,
        });
      }
    };

    const startAudioOnGesture = (): void => {
      unlockAudio();
      unlockChapterAudio();
      syncChapterMusic({ chapterIndex: lastIndex >= 0 ? lastIndex : 0, chapterLocal: 0 });
    };

    const boot = async (): Promise<void> => {
      const [engine, chaptersMod] = await Promise.all([
        import("@/lib/engine"),
        import("@/lib/world/chapters"),
      ]);
      if (disposed) return;
      surface = new engine.Canvas2DSurface(canvas);
      const character = await engine.Character.load(characterManifest, {
        priorityClips: ["idle", "walk", "run", "jump"],
      });
      const world = await engine.loadWorldAssetsStaged(
        sceneManifest,
        propPaths,
        chapterGroundTiles,
      );
      if (disposed) return;
      const chapters = chaptersMod.createChapters({
        projectCount: projects.length,
        skills: skills.slice(0, SKILL_SPOTLIGHT_COUNT).map((s) => ({
          id: s.id,
          label: s.label,
          category: s.category,
          level: s.level,
        })),
        postCount: posts.length,
        scene: world.scene,
        props: world.props,
        grounds: world.grounds,
        getWorkOpen: () => workOpenRef.current,
      });
      stage = new engine.Stage(surface, character, chapters);
      sizeNow();
      onProgress(lastProgress);

      const narrative = document.getElementById("world-narrative");
      if (narrative) narrative.hidden = true;
      const splash = document.getElementById("world-splash");
      if (splash) splash.style.display = "none";

      // maxRate caps how fast the story can play regardless of how hard the user
      // scrolls — lower = more cinematic. 0.08 ≈ 12.5s minimum for a full flick-
      // through (was racing through in ~6s). smoothing adds a little weight/glide.
      timeline = new engine.ScrollTimeline({
        track,
        onProgress,
        maxRate: 0.055,
        smoothing: 5,
      });
      resizeObs = new ResizeObserver(() => {
        sizeNow();
        onProgress(lastProgress);
      });
      resizeObs.observe(stageEl);
      viewObs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry || !timeline) return;
          if (entry.isIntersecting) timeline.start();
          else timeline.stop();
        },
        { threshold: 0 },
      );
      viewObs.observe(track);
      timeline.start();

      forceRedrawRef.current = () => onProgress(lastProgress);

      window.addEventListener("pointerdown", startAudioOnGesture, { once: true });
      window.addEventListener("keydown", startAudioOnGesture, { once: true });
      window.addEventListener("wheel", startAudioOnGesture, { once: true, passive: true });
    };

    boot();

    return () => {
      disposed = true;
      timeline?.stop();
      resizeObs?.disconnect();
      viewObs?.disconnect();
      forceRedrawRef.current = null;
      window.removeEventListener("pointerdown", startAudioOnGesture);
      window.removeEventListener("keydown", startAudioOnGesture);
      window.removeEventListener("wheel", startAudioOnGesture);
      const narrative = document.getElementById("world-narrative");
      if (narrative) narrative.hidden = false;
    };
  }, [enabled, projects.length, posts.length, skills, storyProfile, milestones, posts, storyBeats]);

  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent): void => {
      const track = trackRef.current;
      if (!track) return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        void import("@/lib/engine").then(({ nudgeScrollProgress, SCROLL_NUDGE }) => {
          const nudge = activeIndex === 2 ? SKILLS_SCROLL_NUDGE : SCROLL_NUDGE;
          nudgeScrollProgress(track, nudge.forward);
        });
        unlockAudio();
        sfx.click();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        void import("@/lib/engine").then(({ nudgeScrollProgress, SCROLL_NUDGE }) => {
          const nudge = activeIndex === 2 ? SKILLS_SCROLL_NUDGE : SCROLL_NUDGE;
          nudgeScrollProgress(track, nudge.back);
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, activeIndex]);

  // When the experience can't (or shouldn't) run, reveal the readable page and
  // drop the dark splash so there is never a blank or flashing screen.
  React.useEffect(() => {
    if (!mounted || enabled) return;
    const narrative = document.getElementById("world-narrative");
    if (narrative) narrative.hidden = false;
    const splash = document.getElementById("world-splash");
    if (splash) splash.style.display = "none";
  }, [mounted, enabled]);

  React.useEffect(() => {
    if (activeIndex !== contactChapterIndex || chapterLocal < 0.38 + 0.58 * 0.45) {
      setMetaSecretRevealed(false);
    }
  }, [activeIndex, chapterLocal, contactChapterIndex]);

  React.useEffect(() => {
    if (activeIndex !== contactChapterIndex) setMetaRoomReady(false);
  }, [activeIndex, contactChapterIndex]);

  if (!enabled) return null;

  const activeTitle = chapterMeta[activeIndex]?.title ?? "";
  const activeId = chapterMeta[activeIndex]?.id ?? "intro";
  const chapterGoal = chapterGoals[activeId] ?? "";
  const introBeat =
    activeIndex === 0 ? segmentBeat(chapterLocal, milestones.length, 0.18, 0.88) : null;
  const introMilestone = introBeat ? milestones[introBeat.idx] : null;
  const workList = projects.slice(0, 5);
  const workBridge =
    activeIndex === 1 && workList.length > 0
      ? workBridgeLayout(chapterLocal, workList.length)
      : null;
  const openedProject =
    openedWorkBox !== null && openedWorkBox < workList.length ? workList[openedWorkBox] : null;
  const openedOpenT =
    openedWorkBox !== null ? (workOpenRef.current.get(openedWorkBox) ?? 0) + workAnimTick * 0 : 0;
  const skillList = skills.slice(0, SKILL_SPOTLIGHT_COUNT);
  const skillBeat =
    activeIndex === 2
      ? segmentBeat(chapterLocal, skillList.length, 0.04, 0.96, {
          fadeIn: 0.08,
          fadeOut: 0.88,
        })
      : null;
  const spotlightSkill = skillBeat ? skillList[skillBeat.idx] : null;
  const metaReveal =
    activeIndex === contactChapterIndex ? clamp01((chapterLocal - 0.38) / 0.58) : 0;
  // Mount the 3D scene early in the contact chapter so the GLB parses during the
  // rooftop walk — well before the crossfade at metaReveal ≈ 0.26.
  const metaSceneMounted = activeIndex === contactChapterIndex && chapterLocal > 0.06;
  // The 3D room mounts and holds tight on the center monitor (progress < ~0.12)
  // while the 2D canvas crossfades out beneath it — both show the same live
  // image, so the swap is invisible — then the camera cranes back to isometric.
  const metaRoomProgress = metaRoomReady ? clamp01((metaReveal - 0.3) / 0.7) : 0;
  const metaRoomOpacity = metaRoomReady ? clamp01((metaReveal - 0.26) / 0.1) : 0;
  const metaCanvasOpacity = 1 - clamp01((metaReveal - 0.28) / 0.12);
  // Cinematic depth/vignette swells through the pull-back, then eases off once settled.
  const metaVignette =
    clamp01((metaReveal - 0.3) / 0.25) * (1 - clamp01((metaReveal - 0.9) / 0.1) * 0.6);
  // Hand control to the visitor only once the room has fully settled.
  const metaInteractive = metaReveal > 0.94;
  // How far into the 2D→3D handoff we are (fades the floating quest-line UI).
  const metaHandoff = clamp01((metaReveal - 0.28) / 0.12);
  const metaEasterEggVisible = metaReveal > 0.82;
  const contactBeats = storyBeats.contact ?? [];
  const questLineOpacity =
    activeIndex === contactChapterIndex && chapterLocal > 0.28
      ? 0
      : activeIndex === contactChapterIndex && metaHandoff > 0.15
        ? questLine.opacity * (1 - clamp01(metaHandoff / 0.85))
        : questLine.opacity;

  const toggleMute = (): void => {
    unlockAudio();
    unlockChapterAudio();
    const willEnable = !soundEnabled;
    toggleSound();
    if (willEnable) {
      syncChapterMusic({ chapterIndex: activeIndex, chapterLocal });
    }
  };

  const spawnPing = (clientX: number, clientY: number): void => {
    const layer = pingLayerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const ping = document.createElement("div");
    ping.className =
      "pointer-events-none absolute -mt-3 -ml-3 h-6 w-6 rounded-full border-2 border-white/80";
    ping.style.left = `${clientX - rect.left}px`;
    ping.style.top = `${clientY - rect.top}px`;
    layer.appendChild(ping);
    const anim = ping.animate(
      [
        { transform: "scale(0.3)", opacity: 1 },
        { transform: "scale(2.2)", opacity: 0 },
      ],
      { duration: 420, easing: "ease-out" },
    );
    anim.onfinish = () => ping.remove();
  };

  const downloadResume = (): void => {
    if (!resumeUrl) return;
    unlockAudio();
    sfx.chime();
    const url = resumeUrl;
    const openInTab = (): void => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
    };
    // Force a true download via a blob when the file is reachable (works
    // same-origin, or cross-origin when CORS allows). The `download` attribute is
    // ignored on cross-origin links, so fall back to opening it in a new tab.
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((blob) => {
        const obj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = obj;
        a.download = "soheilnikroo-resume.pdf";
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(obj), 4000);
      })
      .catch(openInTab);
    setNote("Résumé downloaded");
    window.setTimeout(() => setNote((n) => (n === "Résumé downloaded" ? null : n)), 1600);
  };

  const openWorkBox = (idx: number): void => {
    if (!workBridge?.spans[idx]?.visible) return;
    workOpenTargetRef.current.set(idx, 1);
    openedWorkBoxRef.current = idx;
    setOpenedWorkBox(idx);
    unlockAudio();
    sfx.boxOpen();
    forceRedrawRef.current?.();
  };

  const onStagePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a, button, [role='button'], input, textarea")) return;

    unlockAudio();
    sfx.click();
    spawnPing(e.clientX, e.clientY);

    const track = trackRef.current;
    const stageEl = stageRef.current;
    const viewport = viewportRef.current;
    if (!track || !stageEl || !viewport) return;

    void import("@/lib/engine").then(
      ({ classifyTapZone, clientToVirtual, nudgeScrollProgress, SCROLL_NUDGE }) => {
        const virtual = clientToVirtual(
          e.clientX,
          e.clientY,
          viewport,
          stageEl.getBoundingClientRect(),
        );
        if (!virtual) return;

        if (activeIndex === 1 && workBridge) {
          for (const span of workBridge.spans) {
            if (!span.visible) continue;
            const bounds = mysteryBoxBounds(span, performance.now());
            const hit =
              virtual.x >= bounds.cx - bounds.w / 2 &&
              virtual.x <= bounds.cx + bounds.w / 2 &&
              virtual.y >= bounds.cy - bounds.h / 2 &&
              virtual.y <= bounds.cy + bounds.h / 2;
            if (hit) {
              openWorkBox(span.idx);
              return;
            }
          }
        }

        if (activeIndex === 3 && resumeUrl) {
          const postN = Math.min(4, Math.max(0, posts.length));
          if (hitResumeChest(virtual.x, virtual.y, chapterLocal, postN, performance.now())) {
            downloadResume();
            return;
          }
        }

        const nudge = activeIndex === 2 ? SKILLS_SCROLL_NUDGE : SCROLL_NUDGE;
        const zone = classifyTapZone(virtual.x, virtual.y);
        if (zone === "forward") {
          nudgeScrollProgress(track, nudge.forward);
          sfx.chime();
        } else if (zone === "back") {
          nudgeScrollProgress(track, nudge.back);
        } else {
          nudgeScrollProgress(track, nudge.jump);
          sfx.chime();
        }
      },
    );
  };

  return (
    <div ref={trackRef} style={{ height: `${scrollTrackHeightVh}vh` }} className="relative">
      <section
        ref={stageRef}
        aria-label="Interactive pixel-art journey — scroll or tap to play"
        onPointerDown={onStagePointerDown}
        className={`${pixelFont.variable} sticky top-0 h-svh w-full overflow-hidden bg-[#05040b] [font-family:var(--font-pixel),ui-monospace,monospace] text-white select-none`}
      >
        <h1 className="sr-only">
          {profileName} — interactive pixel-art portfolio of a front-end engineer. Scroll to play
          through the story, or use the &ldquo;read as a page&rdquo; button for a text version.
        </h1>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
          style={{ opacity: metaCanvasOpacity }}
        />
        {/* Mount (and start loading the GLB) early in the contact chapter so the
            heavy model is parsed before the camera needs to hold on the wide
            center monitor. Stays invisible until anchors are ready + crossfade. */}
        {metaSceneMounted ? (
          <div
            className="absolute inset-0 z-[15]"
            style={{
              opacity: metaRoomOpacity,
              pointerEvents: metaInteractive ? "auto" : "none",
              visibility: metaRoomOpacity > 0.001 ? "visible" : "hidden",
            }}
            aria-hidden="true"
          >
            <MetaRoomScene
              progress={metaRoomProgress}
              gameFrame={metaGameFrame}
              reducedMotion={reduced}
              interactive={metaInteractive}
              onReady={() => setMetaRoomReady(true)}
            />
            {/* Cinematic vignette — fakes shallow depth + frames the shot. */}
            <div
              className="pointer-events-none absolute inset-0 z-[16]"
              style={{
                opacity: metaVignette,
                background:
                  "radial-gradient(120% 100% at 50% 46%, rgba(0,0,0,0) 52%, rgba(6,4,12,0.55) 100%)",
              }}
            />
            <MetaRoomOverlay
              metaReveal={metaReveal}
              contactBeats={contactBeats}
              email={email}
              resumeUrl={resumeUrl}
              socials={socials}
              onDownloadResume={downloadResume}
              metaEasterEggVisible={metaEasterEggVisible}
              metaSecretRevealed={metaSecretRevealed}
              onRevealSecret={() => setMetaSecretRevealed(true)}
              onDismissSecret={() => setMetaSecretRevealed(false)}
            />
          </div>
        ) : null}
        {/* Click / tap feedback */}
        <div
          ref={pingLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[25] overflow-hidden"
        />

        {/* Progress + chapter label */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-1 bg-white/10">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-amber-200 to-indigo-400"
            style={{ width: "0%" }}
          />
        </div>
        <p className="absolute top-4 left-4 z-20 [font-family:var(--font-pixel),monospace] text-sm font-bold tracking-[0.2em] text-white/85 uppercase sm:text-base">
          {String(activeIndex + 1).padStart(2, "0")} · {activeTitle}
        </p>
        <p className="absolute top-10 left-4 z-20 max-w-56 [font-family:var(--font-pixel),monospace] text-sm text-amber-200/90">
          {chapterGoal ? <span className="text-white/55">{chapterGoal}</span> : null}
        </p>
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
            onClick={toggleMute}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[3px] border-2 border-white/70 bg-[#0d0b16] text-white/85 shadow-[3px_3px_0_rgba(0,0,0,0.6)] transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#05040b] focus-visible:outline-none"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <Link
            href="/read"
            className="min-h-11 rounded-[3px] border-2 border-white/70 bg-[#0d0b16] px-3 py-1.5 text-xs text-white/85 shadow-[3px_3px_0_rgba(0,0,0,0.6)] transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#05040b] focus-visible:outline-none"
          >
            Skip · read as a page
          </Link>
        </div>

        {/* Narration — quest line inside the game frame */}
        <p ref={captionRef} aria-live="polite" style={{ opacity: 0 }} className="sr-only" />

        {/* Game-aligned overlay — matches the letterboxed 480×270 viewport. */}
        <div
          ref={gameViewportRef}
          className="pointer-events-none absolute z-10 overflow-hidden"
          aria-hidden={false}
        >
          {/* Quest narration — thin line above the billboard */}
          <p
            aria-hidden="true"
            style={{ opacity: questLineOpacity }}
            className="pointer-events-none absolute inset-x-0 top-[1%] z-20 mx-auto max-w-[96%] text-center [font-family:var(--font-pixel),monospace] text-xs font-bold text-amber-100 [text-shadow:2px_2px_0_#000] sm:text-sm"
          >
            {questLine.text}
          </p>
          {/* Overlay blocks — one per chapter; only the active is shown. */}
          <div className="pointer-events-none absolute inset-0">
            {/* 0 — Title gate: speech bubble above the character + scroll prompt; fades on first scroll. */}
            <ChapterBlock index={0} activeIndex={activeIndex} blockRefs={blockRefs}>
              {chapterLocal < 0.14 ? (
                <GameDialogueBox
                  speaker={profileName}
                  accent="white"
                  title={`Hey — I'm ${profileName}.`}
                  body={`${role}. ${tagline}`}
                  cta="Are you ready? Scroll to begin."
                  opacity={clamp01(1 - chapterLocal * 6)}
                  beatKey="gate"
                  gate
                />
              ) : null}
              {introMilestone && introBeat ? (
                <GameDialogueBox
                  accent="indigo"
                  kicker={introMilestone.period}
                  title={introMilestone.title}
                  body={introMilestone.description}
                  opacity={introBeat.opacity}
                  dotCount={milestones.length}
                  dotIndex={introBeat.idx}
                  beatKey={`intro-${introBeat.idx}`}
                  compact
                />
              ) : null}
              {chapterLocal < 0.12 ? (
                <p className="pointer-events-none absolute bottom-[22%] left-1/2 z-40 -translate-x-1/2 animate-bounce [font-family:var(--font-pixel),monospace] text-sm font-bold tracking-[0.2em] text-amber-200 uppercase sm:bottom-[20%]">
                  ↓
                </p>
              ) : null}
            </ChapterBlock>

            {/* 1 — Work: each role is a "?" mystery box on the bridge; its card rises
                 above the span that is currently locking in (matches the canvas box
                 x = 0.3 + (0.64/n)·(idx+0.5), clamped so edge cards stay on screen). */}
            <ChapterBlock index={1} activeIndex={activeIndex} blockRefs={blockRefs}>
              {openedProject && openedOpenT > 0.35 ? (
                <GameDialogueBox
                  accent="amber"
                  kicker={`${openedProject.role} · ${openedProject.year}`}
                  title={openedProject.title}
                  body={openedProject.summary}
                  opacity={clamp01((openedOpenT - 0.35) / 0.4)}
                  beatKey={`work-${openedProject.slug}`}
                  dotCount={workList.length}
                  dotIndex={openedWorkBox ?? 0}
                  action={
                    <Link
                      href={`/work/${openedProject.slug}`}
                      className="inline-block min-h-11 border-4 border-amber-300 bg-amber-900 px-4 py-2 [font-family:var(--font-pixel),monospace] text-sm font-bold text-amber-50 shadow-[4px_4px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      Enter project →
                    </Link>
                  }
                />
              ) : null}
            </ChapterBlock>

            {/* 2 — Skills: one skill spotlight; tap for full stats */}
            <ChapterBlock index={2} activeIndex={activeIndex} blockRefs={blockRefs}>
              {spotlightSkill && skillBeat ? (
                <GameDialogueBox
                  accent="cyan"
                  kicker={spotlightSkill.category}
                  title={spotlightSkill.label}
                  body={spotlightSkill.summary || "Tap for full stats"}
                  opacity={skillBeat.opacity}
                  dotCount={skillList.length}
                  dotIndex={skillBeat.idx}
                  beatKey={`skill-${skillBeat.idx}`}
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSkill(spotlightSkill);
                        unlockAudio();
                        sfx.click();
                      }}
                      className="min-h-11 border-4 border-cyan-300 bg-cyan-950 px-4 py-2 [font-family:var(--font-pixel),monospace] text-sm font-bold text-cyan-50 shadow-[4px_4px_0_#000] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      Inspect stats →
                    </button>
                  }
                />
              ) : null}
            </ChapterBlock>

            {/* 3 — Writing: treasure billboard when a blog chest opens */}
            <ChapterBlock index={3} activeIndex={activeIndex} blockRefs={blockRefs}>
              {chestLoot ? (
                <GameDialogueBox
                  accent="emerald"
                  kicker="✦ Treasure found"
                  title={chestLoot.title}
                  body={`${chestLoot.category} · ${chestLoot.minutes} min read`}
                  opacity={1}
                  beatKey={`chest-${chestLoot.slug}`}
                  action={
                    <Link
                      href={`/blog/${chestLoot.slug}`}
                      className="inline-block min-h-11 border-4 border-emerald-300 bg-emerald-900 px-4 py-2 [font-family:var(--font-pixel),monospace] text-sm font-bold text-emerald-50 shadow-[4px_4px_0_#000] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      Read article →
                    </Link>
                  }
                />
              ) : resumeUrl ? (
                <GameDialogueBox
                  accent="amber"
                  title="The vault"
                  body="The first chest holds my résumé — tap it. Scroll right for blog posts."
                  opacity={clamp01(1 - chapterLocal * 0.3)}
                  beatKey="vault-hint"
                  action={
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={downloadResume}
                      className="min-h-11 border-4 border-amber-300 bg-[#1a1208] px-4 py-2 [font-family:var(--font-pixel),monospace] text-sm font-bold text-amber-100 shadow-[4px_4px_0_#000] hover:bg-amber-900 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      ⬇ Download résumé
                    </button>
                  }
                />
              ) : null}
            </ChapterBlock>

            {/* 4 — Contact: rooftop narration only — socials & résumé live in the 3D room. */}
            <ChapterBlock index={4} activeIndex={activeIndex} blockRefs={blockRefs}>
              {chapterLocal < 0.28 ? (
                <GameDialogueBox
                  accent="indigo"
                  title="Almost there."
                  body="Tehran at night. Keep scrolling — one more surprise waiting for you."
                  opacity={clamp01(1 - chapterLocal * 2.2)}
                  beatKey="contact"
                />
              ) : null}
            </ChapterBlock>
          </div>

          {workBridge?.spans
            .filter((span) => span.visible)
            .map((span) => {
              const bounds = mysteryBoxBounds(span, performance.now() + workAnimTick);
              const pct = virtualToPercent(bounds.cx, bounds.cy);
              const project = workList[span.idx];
              return (
                <button
                  key={span.idx}
                  type="button"
                  aria-label={project ? `Open ${project.title} project` : "Open mystery box"}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    openWorkBox(span.idx);
                    spawnPing(e.clientX, e.clientY);
                  }}
                  style={{
                    left: `${pct.xPct}%`,
                    top: `${pct.yPct}%`,
                    width: bounds.w,
                    height: bounds.h,
                  }}
                  className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2 opacity-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                />
              );
            })}
        </div>
        <output
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-28 z-30 mx-auto block w-fit"
        >
          {note ? (
            <span className="rounded-[3px] border-2 border-amber-200/80 bg-[#0d0b16] px-3 py-1.5 text-sm text-amber-100 shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
              {note}
            </span>
          ) : null}
        </output>

        {/* Skill stat card — opens on tap, closes on ✕. */}
        {selectedSkill && activeIndex === 2 ? (
          <WorldSkillOverlay skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
        ) : null}
      </section>
    </div>
  );
}
