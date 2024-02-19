import { SliceZone } from '@prismicio/react';
import { createClient } from '@/prismicio';
import { components } from '@/slices';
import { getLocales } from '@/utils';
import { Footer, Header } from '@/components';
import { Fragment } from 'react';

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
    <Fragment>
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
    </Fragment>
  );
}
