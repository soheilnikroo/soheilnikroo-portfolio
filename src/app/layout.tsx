import { PrismicPreview } from '@prismicio/next';
import clsx from 'clsx';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import { Footer, Header } from '@/components';
import { createClient, repositoryName } from '@/prismicio';

const urbanist = Urbanist({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const settings = await client.getSingle('settings');

  return {
    title: settings.data.meta_title,
    description: settings.data.meta_description,
    // openGraph: {
    //   images: [settings.data.og_image?.url || ''],
    // },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className='bg-slate-900 text-slate-100' lang='en'>
      <body className={clsx(urbanist.className, 'relative min-h-screen')}>
        <Header />
        {children}
        <div className='background-gradient absolute inset-0 -z-50 max-h-screen' />
        <Footer />
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
