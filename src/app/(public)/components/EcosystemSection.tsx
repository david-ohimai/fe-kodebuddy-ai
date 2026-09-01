import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import ecosystemImage from '@/assets/images/landing/ecosystem-connection.png';
import LandingOutlineButton from './LandingOutlineButton';
import SectionHeader from './SectionHeader';

export default function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="scroll-mt-24 bg-background px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1216px] gap-10 rounded-2xl border border-[#dbeaf5] bg-[#f8fbfd] px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
        <div>
          <SectionHeader
            badge="Part of the KodeCamp ecosystem"
            title="Learning with KodeBuddy starts with KodeCamp"
            description="KodeBuddy is the digital learning space within KodeCamp, bringing your learning experience into one structured place."
            align="left"
            className="max-w-[620px]"
          />
          <LandingOutlineButton
            href="#"
            size="small"
            endIcon={<ArrowRight size={16} />}
            className="mt-6 !px-5"
          >
            Learn more about KodeCamp
          </LandingOutlineButton>
        </div>
        <Image
          src={ecosystemImage}
          alt="KodeCamp and KodeBuddy learning ecosystem connection"
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
