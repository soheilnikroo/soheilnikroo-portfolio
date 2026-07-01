import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function cssVars(vars: Record<`--${string}`, string>): CSSProperties {
  return vars;
}
