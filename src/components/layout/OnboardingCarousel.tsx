'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '@/lib/utils/cx';

import slide1 from '@/assets/images/learn-at-pace.webp';
import slide2 from '@/assets/images/get-unstucked.webp';
import slide3 from '@/assets/images/see-progress.webp';

const SLIDES = [
  {
    title: 'Learn at your pace. Grow with confidence.',
    description:
      'KodeBuddy helps you understand what you are learning, recommend what to explore next, and keep your learning journey organised.',
    image: slide1,
  },
  {
    title: 'Get unstuck when you need help.',
    description:
      'Ask KodeBuddy questions, break down difficult concepts, explore ideas, and get guidance that supports the way you learn.',
    image: slide2,
  },
  {
    title: 'See your progress',
    description:
      'Track courses, assignments, goals, and learning progress from one place, so every step forward is visible.',
    image: slide3,
  },
] as const;

const AUTO_SLIDE_MS = 5000;

export interface OnboardingCarouselProps {
  className?: string;
}

export default function OnboardingCarousel({
  className,
}: OnboardingCarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_SLIDE_MS);
  }, [clearTimer]);

  useEffect(() => {
    startTimer();

    return () => {
      clearTimer();
    };
  }, [startTimer, clearTimer]);

  const goTo = (next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    startTimer();
  };

  const slide = SLIDES[index];

  return (
    <div
      className={cx(
        'relative aspect-[350/490] w-full max-w-[600px] overflow-hidden rounded-app',
        className,
      )}
    >
      {/* Slides */}
      {SLIDES.map(({ image }, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={cx(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="350px"
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end gap-5 p-6 lg:p-7">
        <div
          key={index}
          className="animate-[fadeIn_0.5s_ease]"
        >
          <h2 className="h4-b text-white">
            {slide.title}
          </h2>

          <p className="b2-r mt-3 max-w-md text-white/85">
            {slide.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Dots */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cx(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index
                    ? 'w-5 bg-secondary'
                    : 'w-1.5 bg-white/40',
                )}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
