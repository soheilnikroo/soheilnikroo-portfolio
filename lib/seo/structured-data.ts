import { absoluteUrl } from "@/lib/seo/metadata-helpers";

export type BreadcrumbItem = {
  readonly name: string;
  readonly path: string;
};

export function breadcrumbListLd(siteUrl: string, items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

export function graphLd(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
