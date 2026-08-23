'use client';

import { ToastProvider } from '@/components/ui/ToastProvider';

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ToastProvider>{children}</ToastProvider>;
}
