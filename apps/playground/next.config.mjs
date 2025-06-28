import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@penguinjs/ui', 
    '@penguinjs/utils', 
    '@penguinjs/game-engine'
  ],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.github.io',
      },
    ],
  },
};

export default withNextIntl(nextConfig);