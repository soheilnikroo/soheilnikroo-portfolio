import { permanentRedirect } from "next/navigation";

/**
 * The experience now lives at the site root (`/`). This legacy path permanently
 * redirects so old links keep working without creating duplicate content.
 */
export default function WorldPage(): never {
  permanentRedirect("/");
}
