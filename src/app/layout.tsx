import type { Metadata } from 'next';
import './globals.css';
import clsx from 'clsx';
import { createClient, repositoryName } from '@/prismicio';
import { PrismicPreview } from '@prismicio/next';
import { iranyekanFont } from './font';

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const settings = await client.getSingle('settings');

  return {
    title: settings.data.meta_title,
    description: settings.data.meta_description,
    openGraph: {
      images: [settings.data.og_image?.url || ''],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={'bg-slate-900 text-slate-100'}>
      <body className={clsx(iranyekanFont.className, 'relative min-h-screen')}>
        {children}
        <div className='background-gradient absolute inset-0 -z-50 max-h-screen' />
        <div className="pointer-events-none absolute inset-0 -z-40 h-full bg-[url('/noisetexture.jpg')] opacity-20 mix-blend-soft-light"></div>
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
