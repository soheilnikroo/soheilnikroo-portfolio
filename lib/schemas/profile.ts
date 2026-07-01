import { z } from "zod";

import { SocialLinkSchema } from "./social";

export const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  location: z.string().min(1),
  email: z.email(),
  availability: z.string().optional(),
  resumeUrl: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "must be a URL or site path")
    .optional(),
  socials: z.array(SocialLinkSchema).default([]),
});
export type Profile = z.infer<typeof ProfileSchema>;
