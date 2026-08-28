'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth.api';
import { getAccessToken, clearAuthTokens } from '@/lib/api/client';
import type { AuthUser } from '@/types/auth.types';

interface UseCurrentUserResult {
  user: AuthUser | null;
  loading: boolean;
}

export function useCurrentUser(): UseCurrentUserResult {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!getAccessToken()) {
      router.replace('/sign-in');
      return;
    }

    authApi
      .getCurrentProfile()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthTokens();
          router.replace('/sign-in');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { user, loading };
}
