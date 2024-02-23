import type { Content } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import type { SliceComponentProps } from '@prismicio/react';

/**
 * Props for `ImageBlock`.
 */
export type ImageBlockProps = SliceComponentProps<Content.ImageBlockSlice>;

/**
 * Component for "ImageBlock" Slices.
 */
const ImageBlock = ({ slice }: ImageBlockProps): JSX.Element => (
  <PrismicNextImage
    className='not-prose my-10 h-full w-full  rounded-md md:my-14 lg:my-16'
    field={slice.primary.image}
  />
);

export default ImageBlock;
