import { revalidateTag } from "next/cache";

export const CONTENT_CACHE_TAG = "site-content";

/** Shared ISR window for `unstable_cache` (page `revalidate` exports must use the same literal: 300). */
export const CONTENT_CACHE_REVALIDATE_SECONDS = 300;

export function revalidateContent(): void {
  revalidateTag(CONTENT_CACHE_TAG, "max");
}
