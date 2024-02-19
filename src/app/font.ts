import localFont from 'next/font/local';

export const iranyekanFont = localFont({
  variable: '--font-iranyekan',
  display: 'swap',
  src: [
    {
      path: '../../public/fonts/woff/iranyekanwebbold.woff',
      weight: 'bold',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff/iranyekanwebthin.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff/iranyekanwebregular.woff',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff/iranyekanwebmedium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff/iranyekanwebextrabold.woff',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff/iranyekanwebextrablack.woff',
      weight: '950',
      style: 'normal',
    },
  ],
});
