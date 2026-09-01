import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CoursesSection from './CoursesSection';
import HowItWorksSection from './HowItWorksSection';
import LearningSpaceSection from './LearningSpaceSection';
import EcosystemSection from './EcosystemSection';
import CtaSection from './CtaSection';

// Assembles the landing page from its Figma sections, in order. Each
// section is currently a structural placeholder — see the TODO in each
// file. Fill them in one at a time; this file shouldn't need to change
// unless a section is added, removed, or reordered.
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <HowItWorksSection />
      <LearningSpaceSection />
      <EcosystemSection />
      <CtaSection />
    </>
  );
}
