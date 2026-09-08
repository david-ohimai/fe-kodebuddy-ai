const DIRECT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://kodebuddy-ai-be.onrender.com';

const API_BASE_URL =
  typeof window === 'undefined' ||
  process.env.NEXT_PUBLIC_USE_DIRECT_API === 'true'
    ? DIRECT_API_BASE_URL
    : '/api/backend';

const ACCESS_TOKEN_KEY = 'kodebuddy_access_token';
const REFRESH_TOKEN_KEY = 'kodebuddy_refresh_token';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super(
      'Could not reach the server. This is usually a CORS restriction on the backend, the API being unreachable, or (on Render\u2019s free tier) the server waking up from sleep — check the browser console/network tab for the exact error.',
    );
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

interface RefreshResponseDto {
  access_token: string;
  refresh_token: string;
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessTokenOnce(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn(
      '[auth] Access token expired and there is no stored refresh token — the session cannot be silently renewed.',
    );
    return Promise.resolve(null);
  }

  refreshPromise = fetch(`${API_BASE_URL}/user/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.warn(
          `[auth] POST /user/refresh rejected the stored refresh token (status ${res.status}) — the session is genuinely over, not just an expired access token.`,
        );
        return null;
      }
      const data = (await res
        .json()
        .catch(() => null)) as RefreshResponseDto | null;
      if (!data?.access_token) {
        console.warn(
          '[auth] POST /user/refresh returned 200 but no access_token — unexpected response shape.',
        );
        return null;
      }
      setAccessToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      return data.access_token;
    })
    .catch((err) => {
      console.warn('[auth] POST /user/refresh threw:', err);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const NETWORK_RETRY_ATTEMPTS = 2;
const NETWORK_RETRY_DELAY_MS = 2000;

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempt = 0,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    if (attempt < NETWORK_RETRY_ATTEMPTS) {
      await delay(NETWORK_RETRY_DELAY_MS);
      return fetchWithRetry(url, init, attempt + 1);
    }
    throw new NetworkError(cause);
  }
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.detail === 'string') return record.detail;
    if (Array.isArray(record.detail) && record.detail.length > 0) {
      const first = record.detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  return `Request failed with status ${status}`;
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  { body, auth = false, headers, ...rest }: ApiFetchOptions = {},
): Promise<TResponse> {
  // The resource endpoints (POST/PATCH /modules/{id}/resources and the
  // lesson equivalents) take multipart/form-data, not JSON, because they
  // accept an uploaded file alongside the text fields. Passing a FormData
  // body here opts into that: the Content-Type header is deliberately left
  // unset so the browser can generate it *with* the multipart boundary —
  // setting it by hand produces a boundary-less header and the backend
  // fails to parse any field at all.
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const doFetch = async (): Promise<Response> => {
    const requestHeaders = new Headers(headers);
    if (!isFormData) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
      const token = getAccessToken();
      if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    try {
      return await fetchWithRetry(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: requestHeaders,
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      });
    } catch (cause) {
      if (cause instanceof NetworkError) throw cause;
      throw new NetworkError(cause);
    }
  };

  let response = await doFetch();

  const method = (rest.method ?? 'GET').toUpperCase();
  if (
    !response.ok &&
    method === 'GET' &&
    [500, 502, 503, 504].includes(response.status)
  ) {
    for (let attempt = 0; attempt < 2 && !response.ok; attempt++) {
      console.warn(
        `[api] ${path} returned ${response.status} — likely the backend waking up from idle. Retrying (${attempt + 1}/2)...`,
      );
      await delay(1500);
      response = await doFetch();
    }
  }

  if (!response.ok && response.redirected) {
    console.warn(
      `[api] ${path} failed (${response.status}) after following a redirect — retrying once as a fresh request, since redirects can silently drop the Authorization header.`,
    );
    response = await doFetch();
  }

  if (response.status === 401 && auth) {
    console.warn(
      `[auth] 401 on ${path} with an access token present (length ${getAccessToken()?.length ?? 0}) — attempting a refresh-and-retry.`,
    );
    const newAccessToken = await refreshAccessTokenOnce();
    if (newAccessToken) {
      response = await doFetch();
      if (response.status === 401) {
        console.warn(
          `[auth] ${path} still 401 after a successful refresh (new token length ${newAccessToken.length}). This is NOT plain expiry — either this endpoint has its own permission rule, or the refresh token was already rotated by another tab/request before this one used it.`,
        );
      } else {
        console.info(`[auth] ${path} succeeded after refresh-and-retry.`);
      }
    }
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  return payload as TResponse;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof NetworkError) return err.message;
  return fallback;
}

export function warmUpBackend() {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}
