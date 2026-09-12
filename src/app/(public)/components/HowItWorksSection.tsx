import Image from 'next/image';
import { BookMarked, ClipboardCheck, UserRoundPlus } from 'lucide-react';
import howItWorksImage from '@/assets/images/landing/how-it-works.png';
import SectionHeader from './SectionHeader';

const STEPS = [
  {
    title: 'Create your account',
    description: 'Sign up for KodeBuddy and access your learner profile.',
    icon: UserRoundPlus,
  },
  {
    title: 'Choose your course',
    description: 'Pick a learning path and follow structured modules.',
    icon: BookMarked,
  },
  {
    title: 'Start learning',
    description: 'Track progress, complete assignments, and request support.',
    icon: ClipboardCheck,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-background px-5 py-20 text-center sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1216px]">
        <SectionHeader
          badge="How it works"
          title="From your first course to confident learning"
          description="Get started, choose your course, and build your skills through practical learning."
          className="max-w-[920px]"
        />
        <div className="relative mx-auto mt-10 max-w-[980px]">
          <Image
            src={howItWorksImage}
            alt="Three steps for getting started with KodeBuddy"
            className="hidden h-auto w-full md:block"
          />
          <div className="grid gap-4 md:hidden">
            {STEPS.map(({ title, description, icon: Icon }, index) => (
              <div
                key={title}
                className="rounded-lg border border-disabled bg-background p-5 text-left"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light f1-b text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon size={22} className="text-primary" />
                </div>
                <p className="b2-b text-text">{title}</p>
                <p className="f1-r mt-1 text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
