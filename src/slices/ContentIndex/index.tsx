import type { Content } from '@prismicio/client';
import { isFilled } from '@prismicio/client';
import type { SliceComponentProps } from '@prismicio/react';
import { PrismicRichText } from '@prismicio/react';
import { Bounded, ContentList, Heading } from '@/components';
import { createClient } from '@/prismicio';

/**
 * Props for `ContentIndex`.
 */
export type ContentIndexProps = SliceComponentProps<Content.ContentIndexSlice>;

/**
 * Component for "ContentIndex" Slices.
 */
const ContentIndex = async ({
  slice,
}: ContentIndexProps): Promise<JSX.Element> => {
  const client = createClient();
  const blogPosts = await client.getAllByType('blog_post');
  const projects = await client.getAllByType('project');

  const items = slice.primary.content_type === 'Blog' ? blogPosts : projects;

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <Heading className='mb-8' size='xl'>
        {slice.primary.heading}
      </Heading>
      {isFilled.richText(slice.primary.description) && (
        <div className='prose prose-xl prose-invert mb-10'>
          <PrismicRichText field={slice.primary.description} />
        </div>
      )}
      <ContentList
        contentType={slice.primary.content_type}
        fallbackItemImage={slice.primary.fallback_item_image}
        items={items}
        viewMoreText={slice.primary.view_more_text}
      />
    </Bounded>
  );
};

export default ContentIndex;
