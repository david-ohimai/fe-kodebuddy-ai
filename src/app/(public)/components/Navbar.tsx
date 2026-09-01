'use client';

import AppLogo from '@/components/layout/AppLogo';
import AppButton from '@/components/ui/AppButton';
import LandingOutlineButton from './LandingOutlineButton';

const NAV_LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About Kodecamp', href: '#ecosystem' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1216px] items-center justify-between px-5 sm:px-8">
        <AppLogo withTitle width={143} height={28} />

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="f1-m text-text transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LandingOutlineButton href="/sign-in" size="small" className="!px-5">
            Log In
          </LandingOutlineButton>
          <AppButton
            href="/sign-up"
            radius="full"
            size="small"
            className="!px-5"
          >
            Get Started
          </AppButton>
        </div>
      </div>
    </header>
  );
}
