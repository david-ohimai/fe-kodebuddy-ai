import type { NextConfig } from 'next';

/**
 * Where the /api/backend rewrite points.
 *
 * API_ORIGIN is server-only, so it can be changed per environment without a
 * rebuild of client bundles. NEXT_PUBLIC_API_URL is accepted as a fallback
 * because it is what the project already sets, and the default keeps a fresh
 * clone working with no env file at all.
 */
const API_ORIGIN = (
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://kodebuddy-ai-be.onrender.com'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  /**
   * Proxies browser API calls through this app's own origin.
   *
   * Requests from the browser go to /api/backend/... and are forwarded here,
   * so they are same-origin: no CORS preflight, and no need for the backend's
   * FRONTEND_URL to match whichever host the frontend is deployed to (preview
   * deploys get a new URL every time, which that allow-list cannot track).
   *
   * See lib/api/client.ts for the matching base-URL selection.
   */
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
