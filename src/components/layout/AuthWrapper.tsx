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
  footerLink?: {
    label: string;
    href: string;
  };
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
    <div className="relative min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full">
        {/* LEFT PANEL */}
        {leftPanel === 'carousel' && (
          <div className="hidden shrink-0 lg:flex lg:w-[52%] lg:items-center lg:justify-center lg:p-6 xl:p-8">
            <OnboardingCarousel />
          </div>
        )}

        {leftPanel === 'image' && leftImage && (
          <div className="hidden shrink-0 lg:flex lg:w-[52%] lg:items-center lg:justify-center lg:p-6 xl:p-8">
            <Image
              src={leftImage}
              alt={leftImageAlt}
              width={560}
              height={780}
              priority
              className="h-auto w-full max-w-[560px]"
            />
          </div>
        )}

        {/* RIGHT PANEL */}
        <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10 md:px-14">
          {topRightSlot && (
            <div className="absolute right-5 top-5 z-10 sm:right-8 sm:top-6">
              {topRightSlot}
            </div>
          )}

          <div
            className={cx(
              'mx-auto w-full max-w-[580px]',
              contentClassName,
            )}
          >
            {/* LOGO */}
            {showLogo && (
              <div className="mb-6 flex justify-center">
                <AppLogo
                  href="/"
                  width={48}
                  height={44}
                />
              </div>
            )}

            {/* TITLE */}
            {title && (
              <h1 className="h5-b text-center text-text">
                {title}
              </h1>
            )}

            {/* SUBTITLE */}
            {subtitle && (
              <p className="b2-r mt-2 px-1 text-center text-text-secondary">
                {subtitle}
              </p>
            )}

            {/* FORM / CONTENT */}
            <div
              className={cx(
                'w-full',
                Boolean(title || subtitle) && 'mt-6',
              )}
            >
              {children}
            </div>

            {/* FOOTER */}
            {footerText && footerLink && (
              <div className="mt-6 flex items-center justify-center gap-1">
                <span className="b2-r text-text-secondary">
                  {footerText}
                </span>

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
      </div>

      {/* COPYRIGHT */}
      {showCopyright && (
        <p className="f1-r absolute bottom-5 left-5 text-muted sm:left-8">
          © KodeBuddy {new Date().getFullYear()}
        </p>
      )}
    </div>
  );
}
