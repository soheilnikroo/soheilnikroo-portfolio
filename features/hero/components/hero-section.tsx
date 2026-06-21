import { getProfile } from "@/lib/data";

import { HeroInteractive } from "./hero-interactive";

export async function HeroSection() {
  const profile = await getProfile();

  return (
    <HeroInteractive
      name={profile.name}
      role={profile.role}
      tagline={profile.tagline}
      availability={profile.availability}
    />
  );
}
