"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

/**
 * App-wide theme provider (class strategy, matches the `@custom-variant dark`
 * in globals.css). New themes are added by defining a CSS class block + token
 * map in globals.css and listing the theme name via the `themes` prop.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
