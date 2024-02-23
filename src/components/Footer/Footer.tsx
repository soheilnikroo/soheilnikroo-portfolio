import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import clsx from 'clsx';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { Bounded } from '@/components';
import { createClient } from '@/prismicio';

export default async function Footer() {
  const client = createClient();
  const settings = await client.getSingle('settings');
  return (
    <Bounded as='footer' className='text-slate-600'>
      <div className='container mx-auto mt-20 flex flex-col items-center justify-between gap-6 py-8 sm:flex-row '>
        <div className='name flex flex-col items-center justify-center gap-x-4 gap-y-2 sm:flex-row sm:justify-self-start'>
          <Link
            className='text-xl font-extrabold tracking-tighter text-slate-100 transition-colors duration-150 hover:text-yellow-400'
            href='/'
          >
            {settings.data.name}
          </Link>
          <span
            className='hidden text-5xl font-extralight leading-[0] text-slate-400 sm:inline'
            aria-hidden
          >
            /
          </span>
          <p className=' text-sm text-slate-300 '>
            © {new Date().getFullYear()} {settings.data.name}
          </p>
        </div>
        <nav aria-label='Footer Navigation' className='navigation'>
          <ul className='flex items-center gap-1'>
            {settings.data.nav_item.map(({ link, label }, index) => (
              <React.Fragment key={label}>
                <li>
                  <PrismicNextLink
                    field={link}
                    className={clsx(
                      'group relative block overflow-hidden  rounded px-3 py-1 text-base font-bold text-slate-100 transition-colors duration-150 hover:hover:text-yellow-400',
                    )}
                  >
                    {label}
                  </PrismicNextLink>
                </li>
                {index < settings.data.nav_item.length - 1 && (
                  <span
                    aria-hidden='true'
                    className='text-4xl font-thin leading-[0] text-slate-400'
                  >
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>
        <div className='socials inline-flex justify-center sm:justify-end'>
          {isFilled.link(settings.data.github_link) && (
            <PrismicNextLink
              aria-label={`${settings.data.name} on GitHub`}
              className='p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400'
              field={settings.data.github_link}
            >
              <FaGithub />
            </PrismicNextLink>
          )}
          {isFilled.link(settings.data.linkedin_link) && (
            <PrismicNextLink
              aria-label={`${settings.data.name} on LinkedIn`}
              className='p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400'
              field={settings.data.linkedin_link}
            >
              <FaLinkedin />
            </PrismicNextLink>
          )}
        </div>
      </div>
    </Bounded>
  );
}
