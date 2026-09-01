import Image from 'next/image';
import featureCollage from '@/assets/images/landing/learning-space-collage.png';
import SectionHeader from './SectionHeader';

export default function FeaturesSection() {
  return (
    <section
      id="learning-space"
      className="scroll-mt-24 bg-background px-5 pb-20 pt-16 text-center sm:px-8 lg:pb-28"
    >
      <div className="mx-auto max-w-[1216px]">
        <SectionHeader
          badge="Your learning space"
          title="Everything you need to keep learning"
          description="Designed to help you succeed at every step of your path."
          className="max-w-[820px]"
        />
        <div className="relative mx-auto mt-8 max-w-[920px]">
          <Image
            src={featureCollage}
            alt="Learner surrounded by KodeBuddy learning tools"
            className="mx-auto h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
