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
import { site } from "@/lib/config/site";
import { pixelFont } from "@/lib/world/pixel-font";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    creator: "@soheilnikroo",
  },
  keywords: [
    "Soheil Nikroo",
    "front-end engineer",
    "frontend developer",
    "interactive portfolio",
    "pixel art portfolio",
    "Next.js",
    "TypeScript",
    "React",
    "web animation",
    "Tehran",
  ],
  category: "technology",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
  icons: { icon: "/web-app-manifest-192x192.png", apple: "/web-app-manifest-192x192.png" },
  alternates: { types: { "application/rss+xml": `${site.url}/rss.xml` } },
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                  Skip to content
                </a>
                <ClickSpark sparkColor="#818cf8" className="flex min-h-svh flex-col">
                  <SiteHeader />
                  <main id="main" className="flex-1">
                    <RouteTransition>{children}</RouteTransition>
                  </main>
                  <SiteFooter />
                </ClickSpark>
              </AmbientProvider>
            </ScrollProgressProvider>
          </MotionConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
