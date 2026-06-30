import { z } from "zod";

export const NavLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});

export type NavLink = z.infer<typeof NavLinkSchema>;

export const PageCopySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eyebrow: z.string().optional(),
  subtitle: z.string().optional(),
});

export type PageCopy = z.infer<typeof PageCopySchema>;

export const SiteSettingsSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string().min(1)).default([]),
  twitterHandle: z.string().min(1),
  locale: z.string().min(2).default("en_US"),
  nav: z.array(NavLinkSchema).min(1),
  headerBrand: z.string().min(1),
  skipToContent: z.string().min(1),
  footerTagline: z.string().min(1),
  pages: z.object({
    home: z.object({ ogDescription: z.string().min(1) }),
    work: PageCopySchema.extend({
      backLink: z.string().min(1),
      enterLabel: z.string().min(1),
      latestWriting: z.string().min(1),
      allWriting: z.string().min(1),
    }),
    blog: PageCopySchema,
    read: PageCopySchema.extend({ ogDescription: z.string().min(1) }),
    notFound: z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      homeLink: z.string().min(1),
    }),
  }),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
