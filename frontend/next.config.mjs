import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3002';
    return [{ source: '/api/:path*', destination: `${backendUrl}/api/:path*` }];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
