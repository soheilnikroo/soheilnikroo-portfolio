import { revalidateTag } from "next/cache";

export const CONTENT_CACHE_TAG = "site-content";

export function revalidateContent(): void {
  revalidateTag(CONTENT_CACHE_TAG, "max");
}
