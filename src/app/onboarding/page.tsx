import type { Metadata } from 'next';
import Onboarding from './components/Onboarding';

export const metadata: Metadata = {
  title: 'Personalise your learning | KodeBuddy AI',
};

export default function OnboardingPage() {
  return <Onboarding />;
}
