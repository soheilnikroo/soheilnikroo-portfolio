import { getProfile, getProjects, getSkillGraph } from "@/lib/data";

import { SceneDeck } from "./scene-deck";

export async function HomeDeck() {
  const [profile, projects, graph] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkillGraph(),
  ]);
  return <SceneDeck profile={profile} projects={projects} skills={graph.nodes} />;
}
