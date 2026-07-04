import { getProfile } from "@/lib/data";

import { Container } from "./container";
import { SocialNav } from "./social-nav";

export async function SiteFooter({ tagline }: { tagline: string }) {
  const profile = await getProfile();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-section border-t border-border/60 bg-muted/30 py-10 text-foreground">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>

        <SocialNav socials={profile.socials} />

        <p className="text-xs text-muted-foreground">
          © {year} {profile.name} · {tagline}
        </p>
      </Container>
    </footer>
  );
}
