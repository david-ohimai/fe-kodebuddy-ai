import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Provider from './provider';

const lato = Lato({
  weight: ['400', '700'],
  variable: '--font-app-font',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KodeBuddy AI',
  description: 'KodeBuddy AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} antialiased`}>
        <Suspense>
          <Provider>{children}</Provider>
        </Suspense>
      </body>
    </html>
  );
}
