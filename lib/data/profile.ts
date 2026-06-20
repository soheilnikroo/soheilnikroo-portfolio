import { ProfileSchema } from "@/lib/schemas";
import type { Profile } from "@/lib/schemas";

/**
 * Profile content (validated against ProfileSchema). All values are realistic
 * placeholders — edit freely. `email` is a placeholder address; swap it for your
 * preferred contact address.
 */
const profile: Profile = ProfileSchema.parse({
  name: "Soheil Nikroo",
  role: "Software Engineer · Front-end & Product",
  tagline: "I build immersive, accessible web experiences that feel effortless.",
  summary:
    "I'm a software engineer who lives at the intersection of design and engineering. " +
    "I care about motion, performance, and the small details that make an interface feel " +
    "alive — and about the architecture underneath that keeps it maintainable. Lately I've " +
    "been building product experiences at VPORT and exploring scroll-driven storytelling on the web.",
  location: "Remote · GMT+3:30",
  email: "hello@soheilnikroo.dev",
  availability: "Open to select freelance & collaboration",
  resumeUrl: "https://soheilnikroo.dev/resume.pdf",
  socials: [
    { platform: "github", label: "GitHub", href: "https://github.com/soheilnikroo", handle: "@soheilnikroo" },
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/soheilnikroo", handle: "in/soheilnikroo" },
    { platform: "x", label: "X", href: "https://x.com/soheilnikroo", handle: "@soheilnikroo" },
    { platform: "email", label: "Email", href: "mailto:hello@soheilnikroo.dev", handle: "hello@soheilnikroo.dev" },
  ],
});

export function getProfile(): Promise<Profile> {
  return Promise.resolve(profile);
}
