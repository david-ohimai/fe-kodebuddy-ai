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
      // POST /submissions/ is the one route in this API with nothing after
      // the trailing slash. Next's :path* catch-all below reconstructs the
      // destination from matched *segments*, which silently drops a bare
      // trailing slash — so /api/backend/submissions/ was reaching the
      // backend as /submissions (no slash), which FastAPI redirects to
      // /submissions/. Next's rewrite just proxies that redirect response
      // straight through, Location header and all, which points at the
      // real backend origin — so the browser followed a same-origin request
      // into a genuinely cross-origin redirect, and browsers strip the
      // Authorization header when a cross-origin redirect is followed. This
      // explicit rule matches first and hardcodes the trailing slash on the
      // destination, so the request reaches the correct route directly and
      // no redirect (and no header loss) ever happens.
      {
        source: '/api/backend/submissions',
        destination: `${API_ORIGIN}/submissions/`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
