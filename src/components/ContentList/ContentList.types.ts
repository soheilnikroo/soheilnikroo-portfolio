import { Content } from '@prismicio/client';

export type ContentListProps = {
  items: Content.BlogPostDocument[] | Content.ProjectDocument[];
  contentType: Content.ContentIndexSlice['primary']['content_type'];
  fallbackItemImage: Content.ContentIndexSlice['primary']['fallback_item_image'];
  viewMoreText: Content.ContentIndexSlice['primary']['view_more_text'];
};
