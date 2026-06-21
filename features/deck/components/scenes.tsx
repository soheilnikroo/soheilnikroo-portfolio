"use client";

import { AnimatePresence, motion } from "motion/react";

import { SnMark } from "@/components/brand/sn-mark";
import { Container } from "@/components/layout/container";
import { BorderGlow } from "@/components/reactbits/border-glow";
import { RotatingText } from "@/components/reactbits/rotating-text";
import { TrueFocus } from "@/components/reactbits/true-focus";
import { Button } from "@/components/ui/button";
import { milestones } from "@/features/about/about-content";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";
import type { Profile, Project } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SCENE_ROOT = "relative flex min-h-[100svh] w-full items-center overflow-hidden text-white";
const SPRING = { type: "spring", stiffness: 110, damping: 18 } as const;
const EYEBROW = "text-sm font-medium uppercase tracking-[0.28em] text-[#e6c463]";
const HEADING = "font-heading font-semibold tracking-tight text-white";

function rise(delay = 0) {
  return {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.slow, ease: easing("emphasized"), delay },
  };
}

function Counter({ label, phase, count }: { label: string; phase: number; count: number }) {
  return (
    <p className={cn(EYEBROW, "mb-8")}>
      {label}
      <span className="ml-3 text-white/35">
        {String(phase + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
    </p>
  );
}

/* ----------------------------- Intro ----------------------------- */
export function IntroScene({ profile, open }: { profile: Profile; open: boolean }) {
  return (
    <div className={cn(SCENE_ROOT, "justify-center bg-[#060606]")}>
      <Container className="relative z-10 text-center">
        <div className="relative inline-block">
          <span
            aria-hidden="true"
            className="sn-glow absolute inset-0 -z-10 rounded-full blur-3xl"
          />
          <SnMark blink className="block text-[40vw] leading-[0.78] sm:text-[24rem]" />
        </div>
        {open ? (
          <div>
            <motion.h1 {...rise(0.05)} className={cn(HEADING, "mt-2 text-4xl sm:text-6xl")}>
              {profile.name}
            </motion.h1>
            <motion.div
              {...rise(0.18)}
              className="mt-3 flex justify-center text-lg text-white/70 sm:text-xl"
            >
              <RotatingText
                texts={[
                  profile.role,
                  "Front-end Engineer",
                  "Motion & Interaction",
                  "Design-minded Developer",
                ]}
                rotationInterval={2600}
                splitBy="words"
                staggerDuration={0.02}
              />
            </motion.div>
            <motion.p
              {...rise(0.4)}
              className="mt-10 text-xs font-medium tracking-[0.3em] text-[#e6c463]/70 uppercase"
            >
              Scroll to continue
            </motion.p>
          </div>
        ) : (
          <p className="mt-6 text-sm font-medium tracking-[0.35em] text-[#e6c463]/45 uppercase">
            Click or scroll to enter
          </p>
        )}
      </Container>
    </div>
  );
}

/* ----------------------------- About — outlined index + clean reveal ----------------------------- */
export function AboutScene({ phase }: { phase: number }) {
  const idx = Math.min(phase, milestones.length - 1);
  const current = milestones[idx] ?? milestones[0];
  return (
    <div
      className={cn(
        SCENE_ROOT,
        "justify-center bg-[linear-gradient(160deg,#16120a_0%,#0a0a0a_60%,#050505_100%)]",
      )}
    >
      <div className="ambient-grain pointer-events-none absolute inset-0 opacity-[0.04]" />
      <Container className="relative z-10">
        <Counter label="About" phase={phase} count={milestones.length} />
        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-12">
          <AnimatePresence mode="wait">
            <motion.span
              key={`num-${idx}`}
              initial={{ opacity: 0, x: -40, rotate: -8 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={SPRING}
              className="num-outline shrink-0 font-heading text-[26vw] leading-none font-black lg:text-[15rem]"
            >
              {idx + 1}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={SPRING}
              className="max-w-[52ch]"
            >
              <p className="text-sm font-medium tracking-[0.25em] text-[#e6c463]/80 uppercase">
                {current?.period}
              </p>
              <h3 className="mt-3 font-heading text-4xl leading-[1.05] font-bold text-white sm:text-6xl">
                {current?.title}
              </h3>
              <p className="mt-6 text-lg text-pretty text-white/70">{current?.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}

/* ----------------------------- Skills — TrueFocus (focused, one sharp) ----------------------------- */
export function SkillsScene({ labels }: { labels: string[] }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn(SCENE_ROOT, "justify-center bg-[#06060a]")}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,rgba(212,175,55,0.10),transparent_70%)]"
      />
      <Container className="relative z-10 text-center">
        <p className={cn(EYEBROW, "mb-12")}>Skills</p>
        {reduced ? (
          <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-5 text-2xl font-black text-white">
            {labels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : (
          <TrueFocus
            sentence={labels.join("|")}
            separator="|"
            blurAmount={6}
            borderColor="#e6c463"
            glowColor="rgba(230,196,99,0.5)"
            animationDuration={0.5}
            pauseBetweenAnimations={1.1}
            wordClassName="text-2xl text-white sm:text-4xl lg:text-5xl"
            className="mx-auto max-w-4xl"
          />
        )}
      </Container>
    </div>
  );
}

/* ----------------------------- Work — winding road ----------------------------- */
export function WorkScene({ projects, phase }: { projects: Project[]; phase: number }) {
  const reduced = useReducedMotion();
  const count = Math.max(1, projects.length);
  const idx = Math.min(phase, count - 1);
  const current = projects[idx] ?? projects[0];

  const nodes = projects.map((_, i) => ({
    x: i % 2 === 0 ? 36 : 64,
    y: 26 + (count <= 1 ? 0 : (i / (count - 1)) * 50),
    rotate: i % 2 === 0 ? -5 : 5,
  }));
  const node = nodes[idx] ?? { x: 50, y: 50, rotate: 0 };
  const roadFill = count <= 1 ? 1 : idx / (count - 1);

  let d = `M ${nodes[0]?.x ?? 50} 4`;
  nodes.forEach((n, i) => {
    const prev = i === 0 ? { x: nodes[0]?.x ?? 50, y: 4 } : (nodes[i - 1] ?? n);
    const midY = (prev.y + n.y) / 2;
    d += ` C ${prev.x} ${midY}, ${n.x} ${midY}, ${n.x} ${n.y}`;
  });
  const last = nodes[count - 1] ?? { x: 50, y: 96 };
  d += ` C ${last.x} 98, 50 98, 50 100`;

  return (
    <div className={cn(SCENE_ROOT, "bg-[#070605]")}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(212,175,55,0.10),transparent_70%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={0.5}
          strokeDasharray="1.4 1.6"
        />
        <motion.path
          d={d}
          fill="none"
          stroke="url(#road-gold)"
          strokeWidth={0.7}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: reduced ? 1 : Math.max(0.04, roadFill) }}
          transition={{ duration: durations.slower, ease: easing("emphasized") }}
        />
        <defs>
          <linearGradient id="road-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbe9a6" />
            <stop offset="1" stopColor="#9a7726" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-16 right-0 left-0 z-10">
        <Container>
          <Counter label="Work" phase={phase} count={count} />
        </Container>
      </div>

      <motion.div
        animate={{ left: `${node.x}%`, top: `${node.y}%` }}
        transition={SPRING}
        className="absolute z-10 w-[min(86vw,520px)] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div animate={{ rotate: reduced ? 0 : node.rotate }} transition={SPRING}>
          <BorderGlow
            className="p-7"
            borderRadius={24}
            glowRadius={34}
            backgroundColor="#0c0b09"
            glowColor="44 72 62"
            colors={["#fbe9a6", "#e6c463", "#f0c349"]}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={SPRING}
              >
                <div className="flex items-center gap-3 text-sm text-white/45">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ background: current?.accent ?? "#e6c463" }}
                  />
                  {current?.role} · {current?.year}
                </div>
                <h3 className="mt-3 font-heading text-3xl leading-tight font-bold text-white sm:text-5xl">
                  {current?.title}
                </h3>
                <p className="mt-4 text-pretty text-white/70">{current?.summary}</p>
                {current?.links.live ? (
                  <Button
                    asChild
                    size="sm"
                    className="mt-6 bg-[#e6c463] text-black hover:bg-[#f2d57e]"
                  >
                    <a href={current.links.live} target="_blank" rel="noreferrer">
                      Visit
                    </a>
                  </Button>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </BorderGlow>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ----------------------------- Contact — radar beacon ----------------------------- */
export function ContactScene({ profile }: { profile: Profile }) {
  return (
    <div className={cn(SCENE_ROOT, "justify-center bg-[#050505]")}>
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {[30, 46, 62].map((size, i) => (
          <span
            key={size}
            className="radar-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${size}vmin`, height: `${size}vmin`, animationDelay: `${i * 1.1}s` }}
          />
        ))}
      </div>
      <Container className="relative z-10 text-center">
        <motion.p {...rise()} className={EYEBROW}>
          Contact
        </motion.p>
        <motion.h2
          {...rise(0.05)}
          className={cn(HEADING, "mx-auto mt-6 max-w-[14ch] text-5xl leading-[0.95] sm:text-7xl")}
        >
          Let&apos;s build something.
        </motion.h2>
        <motion.div
          {...rise(0.2)}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="bg-[#e6c463] text-black hover:bg-[#f2d57e]">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </Button>
          {profile.socials
            .filter((s) => s.platform !== "email")
            .map((social) => (
              <Button
                asChild
                key={social.platform}
                variant="outline"
                size="lg"
                className="border-[#e6c463]/40 text-[#f0d488] hover:bg-[#e6c463]/10 hover:text-[#f0d488]"
              >
                <a href={social.href} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              </Button>
            ))}
        </motion.div>
      </Container>
    </div>
  );
}
