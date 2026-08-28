'use client';

import { createContext, useContext } from 'react';
import type { AuthUser } from '@/types/auth.types';

interface CurrentUserContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  user: null,
  loading: true,
});

export const CurrentUserProvider = CurrentUserContext.Provider;

export function useCurrentUserContext() {
  return useContext(CurrentUserContext);
}
