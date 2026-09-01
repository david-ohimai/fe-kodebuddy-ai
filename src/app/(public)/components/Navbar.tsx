'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import AppLogo from '@/components/layout/AppLogo';
import AppButton from '@/components/ui/AppButton';
import LandingOutlineButton from './LandingOutlineButton';

const NAV_LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About Kodecamp', href: '#ecosystem' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 4);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-40 bg-background/95 backdrop-blur transition-shadow duration-200',
        hasScrolled ? 'shadow-[0_8px_24px_rgba(17,24,39,0.08)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
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

        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
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

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-disabled text-primary transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          aria-label={
            isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-disabled bg-background px-5 pb-5 pt-3 shadow-[0_14px_30px_rgba(17,24,39,0.08)] sm:px-8 lg:hidden">
          <nav className="mx-auto flex max-w-[1216px] flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="b2-m rounded-btn px-3 py-3 text-text transition-colors hover:bg-primary-light hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mx-auto mt-4 grid max-w-[1216px] grid-cols-2 gap-3">
            <LandingOutlineButton
              href="/sign-in"
              size="small"
              className="w-full"
              onClick={closeMenu}
            >
              Log In
            </LandingOutlineButton>
            <AppButton
              href="/sign-up"
              radius="full"
              size="small"
              fullWidth
              onClick={closeMenu}
            >
              Get Started
            </AppButton>
          </div>
        </div>
      )}
    </header>
  );
}
