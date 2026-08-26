import React from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import AppLogo from '@/components/layout/AppLogo';
import OnboardingCarousel from '@/components/layout/OnboardingCarousel';
import { cx } from '@/lib/utils/cx';

export interface AuthWrapperProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  topRightSlot?: React.ReactNode;
  footerText?: string;
  footerLink?: { label: string; href: string };
  showCopyright?: boolean;
  showLogo?: boolean;
  contentClassName?: string;
  leftPanel?: 'carousel' | 'image' | 'none';
  leftImage?: StaticImageData;
  leftImageAlt?: string;
}

export default function AuthWrapper({
  title,
  subtitle,
  children,
  topRightSlot,
  footerText,
  footerLink,
  showCopyright = false,
  showLogo = true,
  contentClassName,
  leftPanel = 'carousel',
  leftImage,
  leftImageAlt = '',
}: AuthWrapperProps) {
  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {leftPanel === 'carousel' && (
        <div className="hidden shrink-0 p-4 lg:block lg:w-1/2">
          <OnboardingCarousel className="h-[calc(100vh-2rem)]" />
        </div>
      )}

      {leftPanel === 'image' && leftImage && (
        <div className="relative hidden shrink-0 items-center justify-center lg:flex lg:w-1/2">
          <Image
            src={leftImage}
            alt={leftImageAlt}
            className="h-auto w-full max-w-lg object-contain"
            priority
          />
        </div>
      )}

      <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10 md:px-14">
        {topRightSlot && (
          <div className="absolute right-5 top-5 sm:right-8 sm:top-6">
            {topRightSlot}
          </div>
        )}

        <div className={cx('mx-auto w-full max-w-[420px]', contentClassName)}>
          {showLogo && (
            <div className="mb-6 flex justify-center">
              <AppLogo href="/" width={48} height={44} />
            </div>
          )}

          {title && <h1 className="h5-b text-center text-text">{title}</h1>}

          {subtitle && (
            <p className="b2-r mt-2 px-1 text-center text-text-secondary">
              {subtitle}
            </p>
          )}

          <div className={cx('w-full', Boolean(title || subtitle) && 'mt-6')}>
            {children}
          </div>

          {footerText && footerLink && (
            <div className="mt-6 flex items-center justify-center gap-1">
              <span className="b2-r text-text-secondary">{footerText}</span>
              <Link
                href={footerLink.href}
                className="b2-b text-primary hover:underline"
              >
                {footerLink.label}
              </Link>
            </div>
          )}
        </div>
      </div>

      {showCopyright && (
        <p className="f1-r absolute bottom-5 left-5 text-muted sm:left-8">
          © KodeBuddy {new Date().getFullYear()}
        </p>
      )}
    </div>
  );
}
