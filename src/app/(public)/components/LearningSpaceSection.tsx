import Image from 'next/image';
import dashboardScreens from '@/assets/images/landing/dashboard-screens.jpg';
import SectionHeader from './SectionHeader';

const SPACE_ITEMS = [
  'Course overview',
  'Learning content',
  'Assignments',
  'Resources & FAQs',
];

export default function LearningSpaceSection() {
  return (
    <section className="overflow-hidden bg-background px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1216px]">
        <SectionHeader
          badge="Your learning space"
          title="Everything you need for your learning journey in one place."
          description="Learn, practise, access resources, and stay on track, all within your KodeBuddy learning space."
          className="max-w-[1180px]"
        />
        <div className="relative mx-auto mt-14 max-w-[1080px]">
          <div className="absolute inset-x-24 top-[18%] h-[45%] bg-primary/20 blur-3xl" />
          <Image
            src={dashboardScreens}
            alt="KodeBuddy learning dashboard screens"
            className="relative z-10 h-auto w-full"
          />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {SPACE_ITEMS.map((item) => (
            <span
              key={item}
              className="b2-m inline-flex min-w-[124px] justify-center rounded-full border border-secondary px-5 py-2 text-secondary-dark"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
