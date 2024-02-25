if (!self.define) {
  let e,
    s = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = n), (e.onload = s), document.head.appendChild(e);
        } else (e = n), importScripts(n), s();
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[c]) return;
    let r = {};
    const t = (e) => n(e, c),
      o = { module: { uri: c }, exports: r, require: t };
    s[c] = Promise.all(a.map((e) => o[e] || t(e))).then((e) => (i(...e), r));
  };
}
define(['./workbox-c06b064f'], function (e) {
  'use strict';
  importScripts('/fallback-8e5b7798448a30a7.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/bCCrUo0Rw5bsFFN7lfcSy/_buildManifest.js',
          revision: 'e0a21c7d7f93d89dce16df0231dc76f2',
        },
        {
          url: '/_next/static/bCCrUo0Rw5bsFFN7lfcSy/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/0c4b6b70-5bab4d955207d879.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/128.1eafa1cb46681e36.js',
          revision: '1eafa1cb46681e36',
        },
        {
          url: '/_next/static/chunks/141-f49699c04b7282da.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/191.89752d72eebf0357.js',
          revision: '89752d72eebf0357',
        },
        {
          url: '/_next/static/chunks/364-de038652a5f1c655.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/44-31a5df019c0dbd53.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/468-8792bef4803c0700.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/478.4853c853df29d9d7.js',
          revision: '4853c853df29d9d7',
        },
        {
          url: '/_next/static/chunks/479-5fec530d30c417a6.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/48.de798b7b9946f529.js',
          revision: 'de798b7b9946f529',
        },
        {
          url: '/_next/static/chunks/635.4f8e539f0c585a7c.js',
          revision: '4f8e539f0c585a7c',
        },
        {
          url: '/_next/static/chunks/671.511f2dc3c54461ea.js',
          revision: '511f2dc3c54461ea',
        },
        {
          url: '/_next/static/chunks/792-241c4b5e5385d0d4.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/795-b93ebfe2fefbe352.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/795d4814-259905dfdaa59e5d.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/8627a13e-078ac80cb335d14c.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/94.83e9485fce735ed1.js',
          revision: '83e9485fce735ed1',
        },
        {
          url: '/_next/static/chunks/967.af7d79bb707e8cd6.js',
          revision: 'af7d79bb707e8cd6',
        },
        {
          url: '/_next/static/chunks/app/%5Buid%5D/page-75124ffa9d8b3d9c.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/blog/%5Buid%5D/page-051c8c87e900034a.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/layout-458e5bdc5edeb598.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/not-found-71f18de23bd16d3e.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/offline/page-525bc2cb5cad5fa1.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/page-3eb6aa11da2157c4.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/projects/%5Buid%5D/page-1fa7fe35e2604633.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/app/slice-simulator/page-1f593abd3814d554.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/b536a0f1-40fa383fe2ce9580.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/c15bf2b0-4cc2eb5df8ff853e.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/fd9d1056-a130d94efc69278e.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/framework-aec844d2ccbe7592.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/main-135a99f1ecea60ca.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/main-app-fa8d7eeb61f599ee.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/pages/_app-75f6107b0260711c.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/pages/_error-9a890acb1e81c3fc.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-66585dbbe45da630.js',
          revision: 'bCCrUo0Rw5bsFFN7lfcSy',
        },
        {
          url: '/_next/static/css/c475d9084d2e6a50.css',
          revision: 'c475d9084d2e6a50',
        },
        {
          url: '/_next/static/media/01af0fc7b4278e65-s.p.woff2',
          revision: '6fa778aa9ee280df9ff563f3a08b0350',
        },
        {
          url: '/_next/static/media/8cdee4d3ed444abc-s.woff2',
          revision: '420e1e96628860fae605e46bd196926d',
        },
        {
          url: '/animations/404.json',
          revision: 'a9abe19af4f53d1d7ce6f5148e34a742',
        },
        {
          url: '/fallback-8e5b7798448a30a7.js',
          revision: 'a5281aa1504c5d6bcd7ba1097870376a',
        },
        { url: '/favicon.ico', revision: '280c48c48e6fc83ab4ededa0a829f57d' },
        {
          url: '/images/android-chrome-192x192.png',
          revision: 'b5786903ede7106cb663532cb3a7a721',
        },
        {
          url: '/images/android-chrome-512x512.png',
          revision: '8485f7f72a2cc574a73bbb16b2312d7c',
        },
        {
          url: '/images/apple-touch-icon.png',
          revision: '17b37b0ecc18c00dafbafa463e163bd3',
        },
        {
          url: '/images/favicon-16x16.png',
          revision: '6eb8ff6829379274d3da5e4003014281',
        },
        {
          url: '/images/favicon-32x32.png',
          revision: 'd479a59d1b24e5b4b93a55403872c983',
        },
        {
          url: '/images/mstile-150x150.png',
          revision: 'a4d5cea301adc7b20be308de075f240e',
        },
        { url: '/offline', revision: 'bCCrUo0Rw5bsFFN7lfcSy' },
        {
          url: '/swe-worker-4da67dda9bc18c53.js',
          revision: '5a47d90db13bb1309b25bdf7b363570e',
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith('/api/auth/callback') || !s.startsWith('/api/')),
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        n &&
        !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') && n && !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
          {
            handlerDidError: async ({ request: e }) =>
              'undefined' != typeof self ? self.fallback(e) : Response.error(),
          },
        ],
      }),
      'GET',
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0);
});
