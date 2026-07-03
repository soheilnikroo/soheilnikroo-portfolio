import type { Metadata } from "next";

import { ogImageEntries } from "@/lib/seo/metadata-helpers";

export function getGoogleSiteVerification(): string | undefined {
  const value = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return value || undefined;
}

export function defaultOpenGraphImages(siteUrl: string) {
  return ogImageEntries(siteUrl, "/opengraph-image");
}

export function baseSiteMetadata(
  siteUrl: string,
): Pick<Metadata, "verification" | "openGraph" | "twitter" | "robots" | "formatDetection"> {
  const images = defaultOpenGraphImages(siteUrl);
  const verificationCode = getGoogleSiteVerification();
  return {
    ...(verificationCode ? { verification: { google: verificationCode } } : {}),
    openGraph: { images },
    twitter: { images: images.map((image) => image.url) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    formatDetection: { telephone: false, address: false, email: false },
  };
}
