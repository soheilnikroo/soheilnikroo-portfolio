import withPWA from '@ducanh2912/next-pwa';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withPWA({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  dest: 'public',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default nextConfig;
