import type { Content } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';
import { Bounded, Heading } from '@/components';
import { components } from '@/slices';
import { formatDate } from '@/utils';

export default function ContentBody({
  page,
}: {
  page: Content.BlogPostDocument | Content.ProjectDocument;
}) {
  const formattedDate = formatDate(page.data.date);
  return (
    <Bounded as='article'>
      <div className='rounded-2xl border-2 border-slate-800 bg-slate-900 px-4 py-10 md:px-8 md:py-20'>
        <Heading as='h1'>{page.data.title}</Heading>
        <div className='flex flex-wrap gap-4 text-yellow-400'>
          {page.tags.map((tag) => (
            <span key={tag} className='text-xl font-bold'>
              {tag}
            </span>
          ))}
        </div>
        <p className='mt-8 border-b border-slate-600 text-xl font-medium text-slate-300'>
          {formattedDate}
        </p>
        <div className='prose prose-lg prose-invert mt-12 w-full max-w-none md:mt-20'>
          <SliceZone components={components} slices={page.data.slices} />
        </div>
      </div>
    </Bounded>
  );
}
