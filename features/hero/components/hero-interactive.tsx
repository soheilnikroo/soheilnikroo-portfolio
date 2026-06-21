"use client";

import { motion, useScroll, useTransform } from "motion/react";
import * as React from "react";

import { Container } from "@/components/layout/container";
import { DecryptedText } from "@/components/reactbits/decrypted-text";
import { RotatingText } from "@/components/reactbits/rotating-text";
import { ShinyText } from "@/components/reactbits/shiny-text";
import { useAmbient } from "@/features/ambient";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easing } from "@/lib/design/tokens";

import { HeroActions } from "./hero-actions";
import { HeroBackground } from "./hero-background";

type HeroProps = {
  name: string;
  role: string;
  tagline: string;
  availability?: string;
};

/** Word-by-word entrance for the headline (static under reduced motion). */
function SplitHeadline({ text, reduced }: { text: string; reduced: boolean }) {
  if (reduced) return <>{text}</>;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: "0.4em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: durations.slow,
              ease: easing("emphasized"),
              delay: 0.15 + index * 0.12,
            }}
            className="inline-block"
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/**
 * Immersive, sticky-pinned hero with an interactive WebGL line backdrop
 * (FloatingLines), a split-text gradient headline, and scroll-linked transforms.
 * Accessible (real heading + real scroll) and static/silent under reduced motion.
 */
export function HeroInteractive({ name, role, tagline, availability }: HeroProps) {
  const reduced = useReducedMotion();
  const { cue } = useAmbient();
  const outerRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.55, 0.9], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={outerRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative"
      style={reduced ? undefined : { height: "175svh" }}
    >
      <div
        onPointerEnter={() => {
          cue("hover");
        }}
        className="sticky top-0 flex h-svh items-center overflow-hidden"
      >
        <HeroBackground targetRef={outerRef} />
        {/* Soft fade so the aurora never reduces headline contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/60 to-transparent"
        />
        {/* Bold SN brand watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden items-center justify-end pr-[3vw] lg:flex"
        >
          <span className="hero-monogram font-heading text-[30vw] leading-none font-black select-none">
            SN
          </span>
        </div>

        <Container>
          <motion.div
            style={reduced ? undefined : { opacity, scale, y: lift }}
            className="origin-left"
          >
            {availability ? (
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: durations.base, ease: easing("standard") }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                <ShinyText text={availability} disabled={reduced} className="text-xs font-medium" />
              </motion.p>
            ) : null}

            <h1
              id="hero-title"
              className="hero-name mt-6 max-w-[16ch] bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text font-heading text-6xl leading-[0.95] font-bold tracking-tight text-balance text-transparent sm:text-8xl lg:text-[8.5rem]"
            >
              <SplitHeadline text={name} reduced={reduced} />
            </h1>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: durations.slow, ease: easing("standard"), delay: 0.5 }}
              className="mt-5"
            >
              <RotatingText
                texts={[
                  role,
                  "Front-end Engineer",
                  "Motion & Interaction",
                  "Design-minded Developer",
                ]}
                auto={!reduced}
                rotationInterval={2600}
                splitBy="words"
                staggerDuration={0.02}
                mainClassName="text-xl font-medium text-muted-foreground sm:text-2xl"
              />
            </motion.div>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: durations.slow, ease: easing("standard"), delay: 0.62 }}
              className="mt-6 max-w-[var(--prose)] text-lg text-pretty text-foreground/80 sm:text-xl"
            >
              <DecryptedText
                text={tagline}
                animateOn={reduced ? "hover" : "view"}
                speed={28}
                maxIterations={14}
                className="text-foreground/80"
                encryptedClassName="text-muted-foreground/50"
              />
            </motion.p>

            <HeroActions />
          </motion.div>
        </Container>

        <motion.div
          aria-hidden="true"
          style={reduced ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase"
        >
          Scroll
          <span className="hero-scroll-cue h-8 w-px bg-foreground/30" />
        </motion.div>
      </div>
    </section>
  );
}
