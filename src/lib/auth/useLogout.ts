'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthTokens } from '@/lib/api/client';
import { useToast } from '@/components/ui/ToastProvider';

export function useLogout() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setLoading(true);
    clearAuthTokens();
    showSuccess('Logged out', 'You have been successfully logged out.');
    router.push('/sign-in');
  };

  return { logout, loading };
}
