"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { SnMark } from "@/components/brand/sn-mark";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { milestones } from "@/features/about/about-content";
import { SoundToggle } from "@/features/ambient";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";
import type { Profile, Project, SkillNode } from "@/lib/schemas";

import { AboutScene, ContactScene, IntroScene, SkillsScene, WorkScene } from "./scenes";

type DeckProps = {
  profile: Profile;
  projects: Project[];
  skills?: SkillNode[];
};

const STEP_LOCK_MS = 780;
const WHEEL_THRESHOLD = 150;

export function SceneDeck({ profile, projects, skills = [] }: DeckProps) {
  const reduced = useReducedMotion();
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [started, setStarted] = React.useState(false);
  const lockRef = React.useRef(false);
  const touchY = React.useRef<number | null>(null);

  const projectList = React.useMemo(() => projects.slice(0, 4), [projects]);
  const skillLabels = React.useMemo(() => (skills ?? []).map((sk) => sk.label), [skills]);

  const sections = React.useMemo(
    () => [
      { id: "Intro", count: 1 },
      { id: "About", count: milestones.length },
      { id: "Work", count: Math.max(1, projectList.length) },
      { id: "Skills", count: 1 },
      { id: "Contact", count: 1 },
    ],
    [projectList.length],
  );
  const totalSteps = React.useMemo(() => sections.reduce((n, s) => n + s.count, 0), [sections]);

  const locate = React.useCallback(
    (s: number) => {
      let acc = 0;
      for (let i = 0; i < sections.length; i++) {
        const count = sections[i]?.count ?? 1;
        if (s < acc + count) return { section: i, item: s - acc };
        acc += count;
      }
      return { section: sections.length - 1, item: 0 };
    },
    [sections],
  );

  const go = React.useCallback(
    (delta: number) => {
      if (lockRef.current) return;
      setStep((prev) => {
        const next = Math.min(totalSteps - 1, Math.max(0, prev + delta));
        if (next === prev) return prev;
        setDirection(delta);
        lockRef.current = true;
        window.setTimeout(() => {
          lockRef.current = false;
        }, STEP_LOCK_MS);
        return next;
      });
    },
    [totalSteps],
  );

  // Wake on first interaction.
  React.useEffect(() => {
    if (reduced) {
      setStarted(true);
      return;
    }
    if (started) return;
    const wake = () => setStarted(true);
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("wheel", wake, { once: true, passive: true });
    window.addEventListener("keydown", wake, { once: true });
    window.addEventListener("touchstart", wake, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [reduced, started]);

  // Step navigation with a longer threshold (accumulate wheel delta).
  React.useEffect(() => {
    if (reduced || !started) return;
    document.documentElement.style.overflow = "hidden";

    let accum = 0;
    let decay: number | undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockRef.current) return;
      accum += e.deltaY;
      window.clearTimeout(decay);
      decay = window.setTimeout(() => {
        accum = 0;
      }, 220);
      if (Math.abs(accum) >= WHEEL_THRESHOLD) {
        const dir = accum > 0 ? 1 : -1;
        accum = 0;
        go(dir);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY.current === null) return;
      const dy = (e.changedTouches[0]?.clientY ?? touchY.current) - touchY.current;
      if (Math.abs(dy) > 70) go(dy < 0 ? 1 : -1);
      touchY.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.documentElement.style.overflow = "";
      window.clearTimeout(decay);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [reduced, started, go]);

  const renderScene = (sectionIndex: number, item: number) => {
    switch (sectionIndex) {
      case 0:
        return <IntroScene profile={profile} open={started} />;
      case 1:
        return <AboutScene phase={item} />;
      case 2:
        return <WorkScene projects={projectList} phase={item} />;
      case 3:
        return <SkillsScene labels={skillLabels} />;
      default:
        return <ContactScene profile={profile} />;
    }
  };

  if (reduced) {
    return (
      <div className="relative bg-[#060606]">
        {sections.map((s, i) => (
          <section key={s.id} aria-label={s.id}>
            {renderScene(i, s.count - 1)}
          </section>
        ))}
      </div>
    );
  }

  const { section, item } = locate(step);

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-[#060606] text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-50 h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#fbe9a6] to-[#9a7726]"
          animate={{ width: started ? `${((step + 1) / totalSteps) * 100}%` : "0%" }}
          transition={{ duration: durations.base, ease: easing("standard") }}
        />
      </div>

      <motion.header
        className="absolute inset-x-0 top-0 z-50"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: started ? 1 : 0, y: started ? 0 : -12 }}
        transition={{ duration: durations.base, ease: easing("standard") }}
      >
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            onClick={() => setStep(0)}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white/90"
          >
            <SnMark className="text-lg" />
            <span className="font-heading">Soheil&nbsp;Nikroo</span>
          </Link>
          <div className="flex items-center gap-1">
            <SoundToggle />
            <ThemeToggle />
          </div>
        </Container>
      </motion.header>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={section}
          custom={direction}
          initial={{ opacity: 0, y: direction > 0 ? 90 : -90, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: direction > 0 ? -90 : 90, scale: 0.985 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="absolute inset-0"
        >
          {renderScene(section, item)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
