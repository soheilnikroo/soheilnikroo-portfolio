import { z } from "zod";

export const SocialPlatformSchema = z.enum([
  "github",
  "linkedin",
  "instagram",
  "x",
  "email",
  "website",
  "dribbble",
  "youtube",
  "mastodon",
]);

export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;

export const SocialLinkSchema = z.object({
  platform: SocialPlatformSchema,
  label: z.string().min(1),
  href: z.string().min(1),
  handle: z.string().optional(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;
