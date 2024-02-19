'use client';

import { PrismicNextLink } from '@prismicio/next';
import { LanguageSwitcherProps } from './LanguageSwitcher.types';
import { useState, useEffect, useRef } from 'react';

const localeLabels: Record<string, string> = {
  'en-us': 'English',
  'fa-ir': 'فارسی',
};

const LanguageSwitcher = ({
  locales,
  currentLocale,
}: LanguageSwitcherProps): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setVisible((prevVisible) => !prevVisible);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as any)
    ) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      className='relative mx-5 my-3 inline-block text-left'
      ref={dropdownRef}
    >
      <div>
        <button
          type='button'
          className='inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 md:w-48'
          id='options-menu'
          aria-expanded={visible ? 'true' : 'false'}
          aria-haspopup='true'
          onClick={toggleDropdown}
        >
          {localeLabels[currentLocale]}
          <svg
            className={`-mr-1 ml-2 h-5 w-5 ${visible ? 'rotate-180 transform' : ''}`}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.707 7.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 3.414 5.707 7.707z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      {visible && (
        <div
          className='absolute left-0 right-0 top-0 z-10 mt-12  origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none  '
          role='menu'
          aria-orientation='vertical'
          aria-labelledby='options-menu'
        >
          <div className='py-1' role='none'>
            {locales.map((locale) => (
              <PrismicNextLink
                key={locale.lang}
                href={locale.url}
                locale={locale.lang}
                aria-label={`Change language to ${locale.lang_name}`}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${locale.lang === currentLocale ? 'bg-gray-100 font-semibold' : ''}`}
                role='menuitem'
              >
                {localeLabels[locale.lang] || locale.lang}
              </PrismicNextLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
