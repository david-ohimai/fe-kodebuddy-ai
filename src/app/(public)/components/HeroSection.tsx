import Image from 'next/image';
import AppButton from '@/components/ui/AppButton';
import assignmentCard from '@/assets/images/landing/assignment-card.png';
import greenBrushLine from '@/assets/images/landing/green-brush-line.png';
import dashboardPreview from '@/assets/images/landing/hero-dashboard.png';
import learnCard from '@/assets/images/landing/learn-card.png';
import moduleProgress from '@/assets/images/landing/module-progress.png';
import LandingOutlineButton from './LandingOutlineButton';

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-background px-5 pt-14 text-center sm:px-8 lg:pt-16">
      <div className="mx-auto max-w-[1216px]">
        <h1 className="mx-auto max-w-[610px] text-[36px] font-bold leading-[1.08] text-text sm:text-[44px] lg:text-[48px]">
          Learn practical skills.
          <span className="relative inline-block text-primary">
            <span className="relative z-10">Build your future.</span>
            <Image
              src={greenBrushLine}
              alt=""
              aria-hidden="true"
              className="absolute -bottom-5 left-[78%] z-0 h-auto w-[44%] -translate-x-1/2"
            />
          </span>
        </h1>
        <p className="b2-r mx-auto mt-5 max-w-[560px] text-text-secondary">
          KodeBuddy gives you a structured learning space to learn, practise,
          complete assignments, access resources, and get support throughout
          your learning journey.
        </p>
        <div className="relative z-30 mt-7 flex items-center justify-center gap-3">
          <AppButton
            href="/sign-up"
            radius="full"
            size="small"
            className="!px-6"
          >
            Get Started
          </AppButton>
          <LandingOutlineButton href="#courses" size="small">
            Explore courses
          </LandingOutlineButton>
        </div>
        <div className="pointer-events-none relative z-10 mx-auto -mt-14 max-w-[948px]">
          <div className="absolute inset-x-[-12%] top-[18%] h-[42%] bg-primary/15 blur-3xl" />
          <Image
            src={dashboardPreview}
            alt="KodeBuddy learner dashboard preview"
            priority
            className="relative z-10 mx-auto h-auto w-full"
          />
          <Image
            src={learnCard}
            alt=""
            aria-hidden="true"
            className="absolute left-[4%] top-[70%] z-20 w-[24%] max-w-[178px] -translate-y-1/2"
          />
          <Image
            src={assignmentCard}
            alt=""
            aria-hidden="true"
            className="absolute right-[1%] top-[28%] z-20 w-[31%] max-w-[240px]"
          />
          <Image
            src={moduleProgress}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[5%] right-[3%] z-20 w-[22%] max-w-[176px]"
          />
        </div>
      </div>
    </section>
  );
}
