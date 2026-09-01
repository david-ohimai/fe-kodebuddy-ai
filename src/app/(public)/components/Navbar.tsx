'use client';

import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';
import AppButton from '@/components/ui/AppButton';

// TODO: build out per the top navbar in the landing page Figma —
// Courses / How it work / About Kodecamp links, Log In + Get Started.
const NAV_LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'How it work', href: '#how-it-works' },
  { label: 'About Kodecamp', href: '#ecosystem' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-disabled bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <AppLogo withTitle width={140} height={28} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="b2-m text-text-secondary hover:text-text">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AppButton href="/sign-in" variant="text" color="neutral">
            Log In
          </AppButton>
          <AppButton href="/sign-up" radius="full">
            Get Started
          </AppButton>
        </div>
      </div>
    </header>
  );
}
