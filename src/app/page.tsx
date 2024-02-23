import { SliceZone } from '@prismicio/react';
import type { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { components } from '@/slices';

export default async function Page() {
  const client = createClient();
  const page = await client.getByUID('page', 'home');

  return <SliceZone components={components} slices={page.data.slices} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getByUID('page', 'home');

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
  };
}
