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

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_SLIDE_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer]);

  const goTo = (next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    startTimer();
  };

  const slide = SLIDES[index];

  return (
    <div
      className={cx(
        'relative flex h-full w-full flex-col overflow-hidden rounded-app',
        className,
      )}
    >
      {SLIDES.map(({ image }, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={cx(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/100 via-black/30" />
      <div className="relative z-10 mt-auto flex flex-col gap-5 p-8 lg:p-10">
        <div key={index} className="animate-[fadeIn_0.5s_ease]">
          <h2 className="h4-b text-white">{slide.title}</h2>
          <p className="b2-r mt-3 max-w-md text-white/85">
            {slide.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" role="tablist">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cx(
                  'h-2 rounded-full transition-all duration-300',
                  i === index ? 'w-6 bg-secondary' : 'w-2 bg-white/40',
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
