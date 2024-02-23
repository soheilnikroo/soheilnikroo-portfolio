import type { Content } from '@prismicio/client';
import type { SliceComponentProps } from '@prismicio/react';
import { PrismicRichText } from '@prismicio/react';
import { Avatar, Bounded, Button, Heading } from '@/components';

/**
 * Props for `Biography`.
 */
export type BiographyProps = SliceComponentProps<Content.BiographySlice>;

/**
 * Component for "Biography" Slices.
 */
const Biography = ({ slice }: BiographyProps): JSX.Element => (
  <Bounded
    data-slice-type={slice.slice_type}
    data-slice-variation={slice.variation}
  >
    <div className='grid gap-x-8 gap-y-6 md:grid-cols-[2fr,1fr]'>
      <Heading className='col-start-1' size='xl'>
        {slice.primary.heading}
      </Heading>

      <div className='prose prose-xl prose-slate prose-invert col-start-1'>
        <PrismicRichText field={slice.primary.description} />
      </div>
      <Button
        className='text-black'
        label={slice.primary.button_text}
        linkField={slice.primary.button_link}
      />

      <Avatar
        className='row-start-1 max-w-sm md:col-start-2 md:row-end-3'
        image={slice.primary.avatar}
      />
    </div>
  </Bounded>
);

export default Biography;
