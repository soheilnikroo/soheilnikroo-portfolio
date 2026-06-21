"use client";

// Adapted from React Bits (https://reactbits.dev) — "DecryptedText". Named export.
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import * as React from "react";

interface DecryptedTextProps extends HTMLMotionProps<"span"> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: "view" | "hover";
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = React.useState(text);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [revealedIndices, setRevealedIndices] = React.useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const availableChars = React.useMemo<string[]>(
    () =>
      useOriginalCharsOnly
        ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
        : characters.split(""),
    [useOriginalCharsOnly, text, characters],
  );

  const shuffleText = React.useCallback(
    (originalText: string, currentRevealed: Set<number>) =>
      originalText
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)] ?? char;
        })
        .join(""),
    [availableChars],
  );

  React.useEffect(() => {
    if (!isAnimating) return;
    let iteration = 0;
    const id = setInterval(() => {
      setRevealedIndices((prev) => {
        if (sequential) {
          if (prev.size < text.length) {
            const nextIndex =
              revealDirection === "end"
                ? text.length - 1 - prev.size
                : revealDirection === "center"
                  ? Math.floor(text.length / 2) +
                    (prev.size % 2 === 0 ? prev.size / 2 : -Math.ceil(prev.size / 2))
                  : prev.size;
            const next = new Set(prev);
            next.add(Math.max(0, Math.min(text.length - 1, nextIndex)));
            setDisplayText(shuffleText(text, next));
            return next;
          }
          clearInterval(id);
          setIsAnimating(false);
          setDisplayText(text);
          return prev;
        }
        setDisplayText(shuffleText(text, prev));
        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(id);
          setIsAnimating(false);
          setDisplayText(text);
        }
        return prev;
      });
    }, speed);
    return () => clearInterval(id);
  }, [isAnimating, text, speed, maxIterations, sequential, revealDirection, shuffleText]);

  const start = React.useCallback(() => {
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsAnimating(true);
  }, [text]);

  const reset = React.useCallback(() => {
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
  }, [text]);

  React.useEffect(() => {
    if (animateOn !== "view") return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            start();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, start]);

  const hoverProps = animateOn === "hover" ? { onMouseEnter: start, onMouseLeave: reset } : {};

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const revealed = revealedIndices.has(index) || !isAnimating;
          return (
            <span key={index} className={revealed ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
