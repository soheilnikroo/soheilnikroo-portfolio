import { ProfileSchema } from "@/lib/schemas";
import type { Profile } from "@/lib/schemas";

const profile: Profile = ProfileSchema.parse({
  name: "Soheil Nikroo",
  role: "Senior Frontend Engineer · Snapp",
  tagline:
    "TypeScript, React, Next.js at scale — PWAs, UI systems, performance, and mobile-first craft.",
  summary:
    "Frontend engineer at Snapp since 2022, building high-traffic consumer web apps with " +
    "TypeScript, React, and Next.js. I focus on design patterns, UI kit work, PWAs, and " +
    "mobile-first delivery at scale — plus cross-browser quality, testing, and Agile ownership. " +
    "Always learning: Swift & SwiftUI, and a bit of Rust.",
  location: "Tehran, Iran",
  email: "soheiln1234@gmail.com",
  availability: "Open to select freelance & collaboration",
  resumeUrl: "https://soheilnikroo.dev/resume.pdf",
  socials: [
    {
      platform: "github",
      label: "GitHub",
      href: "https://github.com/soheilnikroo",
      handle: "@soheilnikroo",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/soheilnikroo",
      handle: "in/soheilnikroo",
    },
    { platform: "x", label: "X", href: "https://x.com/soheilnikroo", handle: "@soheilnikroo" },
    {
      platform: "email",
      label: "Email",
      href: "mailto:soheiln1234@gmail.com",
      handle: "soheiln1234@gmail.com",
    },
  ],
});

export function getProfile(): Promise<Profile> {
  return Promise.resolve(profile);
}
