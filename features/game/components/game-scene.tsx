"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import * as React from "react";

import { Container } from "@/components/layout/container";
import { RotatingText } from "@/components/reactbits/rotating-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { HeroActions } from "@/features/hero/components/hero-actions";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { Astronaut } from "./astronaut";

type GameSceneProps = {
  name: string;
  role: string;
  tagline: string;
  availability?: string;
};

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 47) % 100,
  y: (i * 83) % 100,
  s: (i % 3) + 1,
  o: 0.3 + ((i * 7) % 6) / 10,
  tw: i % 4 === 0,
  d: (i % 5) * 0.6,
}));

const STORY: { at: number; text: string }[] = [
  { at: 0, text: "Hey — I'm Soheil. Tap in." },
  { at: 0.3, text: "Diving into my world…" },
  { at: 0.58, text: "I craft immersive interfaces." },
  { at: 0.85, text: "Keep going — there's more below." },
];

export function GameScene({ name, role, tagline, availability }: GameSceneProps) {
  const reduced = useReducedMotion();
  const outerRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const [line, setLine] = React.useState(STORY[0]?.text ?? "");
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const current = [...STORY].reverse().find((s) => v >= s.at) ?? STORY[0];
    setLine(current?.text ?? "");
  });

  const charTop = useTransform(scrollYProgress, [0, 0.92, 1], ["14%", "70%", "70%"]);
  const charSway = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 34, -30, 20, 0]);
  const charRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 10, 0]);
  const trailScale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.2, 1, 1, 0.2]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.16], [0, -50]);
  const nebulaY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const starsY = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const planetY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  if (reduced) {
    return (
      <section id="top" aria-labelledby="hero-title" className="relative">
        <Container className="flex min-h-[82svh] flex-col justify-center py-section">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <Astronaut className="h-44 w-36 shrink-0" />
            <div>
              {availability ? (
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                  {availability}
                </p>
              ) : null}
              <h1
                id="hero-title"
                className="font-heading text-5xl font-bold tracking-tight sm:text-7xl"
              >
                {name}
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">{role}</p>
              <p className="mt-4 max-w-[var(--prose)] text-lg text-foreground/80">{tagline}</p>
              <HeroActions />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative"
      style={{ height: "340svh" }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#10173a_0%,#070815_55%,#04040b_100%)]">
        {/* Nebula glow */}
        <motion.div aria-hidden="true" style={{ y: nebulaY }} className="absolute inset-0">
          <div
            className="absolute top-[6%] -left-[8%] h-[42vmax] w-[42vmax] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.40), transparent 62%)",
            }}
          />
          <div
            className="absolute top-[24%] -right-[6%] h-[36vmax] w-[36vmax] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.30), transparent 62%)",
            }}
          />
          <div
            className="absolute bottom-[-12%] left-[28%] h-[46vmax] w-[46vmax] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(236,72,153,0.24), transparent 62%)",
            }}
          />
        </motion.div>

        {/* Planet */}
        <motion.div
          aria-hidden="true"
          style={{ y: planetY }}
          className="absolute top-[12%] right-[9%]"
        >
          <div
            className="size-36 rounded-full sm:size-52"
            style={{
              background: "radial-gradient(36% 36% at 34% 30%, #d8b4fe, #7c3aed 46%, #2e1065 100%)",
              boxShadow: "0 0 90px 12px rgba(124,58,237,0.35)",
            }}
          />
        </motion.div>

        {/* Stars */}
        <motion.div aria-hidden="true" style={{ y: starsY }} className="absolute inset-0">
          {STARS.map((star, i) => (
            <span
              key={i}
              className={`absolute rounded-full bg-white ${star.tw ? "star-twinkle" : ""}`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.s,
                height: star.s,
                opacity: star.o,
                animationDelay: `${star.d}s`,
              }}
            />
          ))}
        </motion.div>

        {/* Intro copy in a glass card */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-x-0 top-[12svh] z-20"
        >
          <Container className="flex justify-center">
            <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-md sm:px-10">
              {availability ? (
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
                  <ShinyText text={availability} className="text-xs font-medium" />
                </p>
              ) : null}
              <h1
                id="hero-title"
                className="hero-name mx-auto max-w-[18ch] bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text font-heading text-5xl leading-[0.95] font-bold tracking-tight text-transparent sm:text-7xl"
              >
                {name}
              </h1>
              <div className="mt-4 flex justify-center text-lg font-medium text-white/75 sm:text-xl">
                <RotatingText
                  texts={[
                    role,
                    "Front-end Engineer",
                    "Motion & Interaction",
                    "Design-minded Developer",
                  ]}
                  rotationInterval={2600}
                  splitBy="words"
                  staggerDuration={0.02}
                  mainClassName="justify-center"
                />
              </div>
              <p className="mx-auto mt-5 max-w-[var(--prose)] text-base text-pretty text-white/75 sm:text-lg">
                {tagline}
              </p>
              <div className="flex justify-center">
                <HeroActions />
              </div>
            </div>
          </Container>
        </motion.div>

        {/* Astronaut diving */}
        <motion.div
          style={{ top: charTop, x: charSway, rotate: charRotate }}
          className="absolute left-1/2 z-10 -ml-12 w-24"
        >
          <motion.div
            style={{ scaleY: trailScale }}
            className="absolute bottom-full left-1/2 h-44 w-2 origin-bottom -translate-x-1/2 rounded-full"
          >
            <div
              className="h-full w-full rounded-full blur-[2px]"
              style={{ background: "linear-gradient(to top, rgba(34,211,238,0.7), transparent)" }}
            />
          </motion.div>
          <Astronaut className="h-auto w-full drop-shadow-[0_10px_30px_rgba(34,211,238,0.35)]" />
          <div className="absolute top-2 left-full ml-3 w-max max-w-[42vw] rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-xs text-white/90 backdrop-blur-md">
            {line}
          </div>
        </motion.div>

        {/* Vignette + grain for depth */}
        <div
          aria-hidden="true"
          className="scene-vignette pointer-events-none absolute inset-0 z-[5]"
        />
        <div
          aria-hidden="true"
          className="ambient-grain pointer-events-none absolute inset-0 z-[5]"
        />

        <motion.div
          aria-hidden="true"
          style={{ opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-fit flex-col items-center gap-2 font-mono text-xs tracking-widest text-white/60 uppercase"
        >
          Scroll
          <span className="hero-scroll-cue h-8 w-px bg-white/40" />
        </motion.div>
      </div>
    </section>
  );
}
