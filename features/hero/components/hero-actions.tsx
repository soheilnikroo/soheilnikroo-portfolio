"use client";

import { ArrowDown, Mail } from "lucide-react";
import Link from "next/link";

import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { useAmbient } from "@/features/ambient";

export function HeroActions() {
  const { cue } = useAmbient();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Magnetic>
        <Button asChild size="lg">
          <Link
            href="/#work"
            onPointerEnter={() => {
              cue("hover");
            }}
            onClick={() => {
              cue("select");
            }}
          >
            View my work
            <ArrowDown
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/button:translate-y-0.5"
            />
          </Link>
        </Button>
      </Magnetic>
      <Magnetic>
        <Button asChild size="lg" variant="outline">
          <Link
            href="/#contact"
            onPointerEnter={() => {
              cue("hover");
            }}
            onClick={() => {
              cue("select");
            }}
          >
            Get in touch
            <Mail
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/button:-translate-y-0.5"
            />
          </Link>
        </Button>
      </Magnetic>
    </div>
  );
}
