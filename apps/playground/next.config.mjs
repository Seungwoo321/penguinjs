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
    // optimizeCss: true, // Disabled due to critters module error
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.github.io',
      },
    ],
  },
  // 폰트 프리로딩 최적화
  async headers() {
    return [
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);