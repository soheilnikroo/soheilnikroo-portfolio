import { ProfileSchema } from "@/lib/schemas";
import type { Profile } from "@/lib/schemas";

/**
 * Placeholder profile (validated against the schema). Step 6 expands this with
 * the full, edit-ready content. Keep all real values in one place.
 */
const profile: Profile = ProfileSchema.parse({
  name: "Soheil Nikroo",
  role: "Software Engineer",
  tagline: "I build immersive, accessible web experiences.",
  summary:
    "Engineer focused on thoughtful interfaces, motion, and front-end architecture.",
  location: "Remote",
  email: "hello@soheilnikroo.dev",
  socials: [
    { platform: "github", label: "GitHub", href: "https://github.com/soheilnikroo" },
    { platform: "email", label: "Email", href: "mailto:hello@soheilnikroo.dev" },
  ],
});

export function getProfile(): Promise<Profile> {
  return Promise.resolve(profile);
}
