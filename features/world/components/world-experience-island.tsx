"use client";

import dynamic from "next/dynamic";

import type { WorldExperienceProps } from "./world-experience";

const WorldExperience = dynamic(
  () => import("./world-experience").then((mod) => mod.WorldExperience),
  { ssr: false },
);

export function WorldExperienceIsland(props: WorldExperienceProps) {
  return <WorldExperience {...props} />;
}
