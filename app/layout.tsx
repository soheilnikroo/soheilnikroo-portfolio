import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";

import { AhrefsAnalytics } from "@/components/analytics/ahrefs-analytics";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";
import { SiteFooter, SiteFooterGate, SiteHeader } from "@/components/layout";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { MotionConfigProvider, ScrollProgressProvider } from "@/components/motion";
import { RouteTransition } from "@/components/motion/route-transition";
import { ClickSpark } from "@/components/reactbits/click-spark";
import { ThemeMetaSync } from "@/components/theme/theme-meta-sync";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { WorldThemeSync } from "@/components/theme/world-theme-sync";
import { CustomCursor } from "@/components/visual/custom-cursor";
import { AmbientBackground, AmbientProvider } from "@/features/ambient";
import { getSiteSettings, getSiteUrl } from "@/lib/data/site-settings";
import { baseSiteMetadata } from "@/lib/seo/site-metadata";

import "./globals.css";

/** ISR — keep in sync with CONTENT_CACHE_REVALIDATE_SECONDS (lib/data/revalidate-content.ts). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const url = getSiteUrl();
  const base = baseSiteMetadata(url);
  return {
    metadataBase: new URL(url),
    title: { default: settings.title, template: `%s — ${settings.name}` },
    description: settings.description,
    applicationName: settings.name,
    authors: [{ name: settings.name, url }],
    creator: settings.name,
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.title,
      description: settings.description,
      url,
      locale: settings.locale,
      images: base.openGraph?.images,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title,
      description: settings.description,
      creator: settings.twitterHandle,
      images: base.twitter?.images,
    },
    category: "technology",
    robots: base.robots,
    formatDetection: base.formatDetection,
    verification: base.verification,
    appleWebApp: { capable: true, title: settings.name, statusBarStyle: "black-translucent" },
    icons: { icon: "/web-app-manifest-192x192.png", apple: "/web-app-manifest-192x192.png" },
    alternates: {
      types: {
        "application/rss+xml": `${url}/rss.xml`,
        "text/markdown": `${url}/llms.txt`,
      },
    },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0918" },
    { media: "(prefers-color-scheme: light)", color: "#f3f0fa" },
  ],
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html
      lang={settings.locale.split("_")[0] ?? "en"}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <AhrefsAnalytics />
        <MicrosoftClarity />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WorldThemeSync />
          <ThemeMetaSync />
          <MotionConfigProvider>
            <ScrollProgressProvider>
              <AmbientProvider bedSrc="/audio/ambient/site-bed.ogg">
                <AmbientBackground />
                <CustomCursor />
                <SkipToContent label={settings.skipToContent} />
                <ClickSpark sparkColor="#818cf8" className="flex min-h-svh flex-col">
                  <SiteHeader nav={settings.nav} brand={settings.headerBrand} />
                  <main id="main" className="flex-1">
                    <RouteTransition>{children}</RouteTransition>
                  </main>
                  <SiteFooterGate>
                    <SiteFooter tagline={settings.footerTagline} />
                  </SiteFooterGate>
                </ClickSpark>
              </AmbientProvider>
            </ScrollProgressProvider>
          </MotionConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
