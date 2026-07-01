import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout";
import { MotionConfigProvider, ScrollProgressProvider } from "@/components/motion";
import { RouteTransition } from "@/components/motion/route-transition";
import { ClickSpark } from "@/components/reactbits/click-spark";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { WorldThemeSync } from "@/components/theme/world-theme-sync";
import { CustomCursor } from "@/components/visual/custom-cursor";
import { AmbientBackground, AmbientProvider } from "@/features/ambient";
import { getSiteSettings, getSiteUrl } from "@/lib/data/site-settings";
import { pixelFont } from "@/lib/world/pixel-font";

import "./globals.css";

/** ISR — keep in sync with CONTENT_CACHE_REVALIDATE_SECONDS (lib/data/revalidate-content.ts). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const url = getSiteUrl();
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
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title,
      description: settings.description,
      creator: settings.twitterHandle,
    },
    keywords: settings.keywords,
    category: "technology",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    formatDetection: { telephone: false, address: false, email: false },
    appleWebApp: { capable: true, title: settings.name, statusBarStyle: "black-translucent" },
    icons: { icon: "/web-app-manifest-192x192.png", apple: "/web-app-manifest-192x192.png" },
    alternates: { types: { "application/rss+xml": `${url}/rss.xml` } },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05040b" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
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
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${pixelFont.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WorldThemeSync />
          <MotionConfigProvider>
            <ScrollProgressProvider>
              <AmbientProvider bedSrc="/audio/ambient/site-bed.ogg">
                <AmbientBackground />
                <CustomCursor />
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-3 focus:ring-ring/50"
                >
                  {settings.skipToContent}
                </a>
                <ClickSpark sparkColor="#818cf8" className="flex min-h-svh flex-col">
                  <SiteHeader nav={settings.nav} brand={settings.headerBrand} />
                  <main id="main" className="flex-1">
                    <RouteTransition>{children}</RouteTransition>
                  </main>
                  <SiteFooter tagline={settings.footerTagline} />
                </ClickSpark>
              </AmbientProvider>
            </ScrollProgressProvider>
          </MotionConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
