import type { NextConfig } from 'next';

const API_ORIGIN = (
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://kodebuddy-ai-be.onrender.com'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: '100mb',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/submissions',
        destination: `${API_ORIGIN}/submissions/`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${API_ORIGIN}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
