import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import './globals.css';

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
      <body className={`${lato.variable} antialiased`}>{children}</body>
    </html>
  );
}
