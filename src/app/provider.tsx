'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { warmUpBackend } from '@/lib/api/client';

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    warmUpBackend();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
