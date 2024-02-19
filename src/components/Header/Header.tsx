import React from 'react';
import { createClient } from '@/prismicio';
import { NavBar } from '@/components';
import type { Locales } from '@/components/LanguageSwitcher/LanguageSwitcher.types';

export default async function Header({
  locales,
  lang,
}: {
  locales: Locales;
  lang: string;
}) {
  const client = createClient();
  const settings = await client.getSingle('settings', { lang });

  return (
    <header className='top-0  z-50 mx-auto max-w-7xl md:sticky md:top-4'>
      <NavBar currentLocale={lang} locales={locales} settings={settings} />
    </header>
  );
}
