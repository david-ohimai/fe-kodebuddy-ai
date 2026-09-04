import Image from 'next/image';
import AppButton from '@/components/ui/AppButton';
import ctaPattern from '@/assets/images/landing/cta-pattern.png';

export default function CtaSection() {
  return (
    <section className="relative flex min-h-[380px] items-start justify-center overflow-hidden bg-primary px-5 py-20 text-center sm:px-8 lg:py-24">
      <Image
        src={ctaPattern}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-160px] left-1/2 h-auto w-[1700px] max-w-none -translate-x-1/2 opacity-95"
      />
      <div className="relative z-10 mx-auto max-w-[1216px]">
        <h2 className="mx-auto max-w-[560px] text-[30px] font-bold leading-tight text-white sm:text-[44px]">
          Ready to start learning?
        </h2>
        <p className="b2-r mx-auto mt-5 max-w-[460px] text-white">
          Create your KodeBuddy account and begin your learning journey.
        </p>
        <AppButton
          href="/sign-up"
          variant="text"
          color="neutral"
          radius="full"
          size="medium"
          className="mt-7 !bg-white !px-9 !text-primary hover:!bg-primary-light"
        >
          Get Started
        </AppButton>
      </div>
    </section>
  );
}
