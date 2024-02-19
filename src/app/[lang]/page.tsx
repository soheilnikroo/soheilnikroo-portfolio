import { Metadata } from 'next';
import { SliceZone } from '@prismicio/react';
import { createClient } from '@/prismicio';
import { components } from '@/slices';
import { getLocales } from '@/utils';
import { Footer, Header } from '@/components';

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const client = createClient();
  const home = await client.getByUID('page', 'home', { lang });

  return {
    title: home.data.meta_title,
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title || undefined,
      images: [
        {
          url: home.data.meta_image.url || '',
        },
      ],
    },
  };
}

export default async function Index({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const client = createClient();
  const home = await client.getByUID('page', 'home', {
    lang,
  });

  const locales = await getLocales(home, client);

  return (
    <>
      <main lang={lang} dir={lang === 'fa-ir' ? 'rtl' : 'ltr'}>
        <Header lang={lang} locales={locales} />
        <SliceZone
          context={{
            lang,
          }}
          slices={home.data.slices}
          components={components}
        />
      </main>
      <Footer lang={lang} />
    </>
  );
}
