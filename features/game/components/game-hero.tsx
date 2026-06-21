import { getProfile } from "@/lib/data";

import { GameScene } from "./game-scene";

export async function GameHero() {
  const profile = await getProfile();
  return (
    <GameScene
      name={profile.name}
      role={profile.role}
      tagline={profile.tagline}
      availability={profile.availability}
    />
  );
}
