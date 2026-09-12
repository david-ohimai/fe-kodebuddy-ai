'use client';

import { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
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

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ToastProvider>{children}</ToastProvider>
      </LocalizationProvider>
    </NextThemesProvider>
  );
}
