'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/layout/AuthWrapper';
import AuthStatusScreen from '@/components/layout/AuthStatusScreen';
import PersonalizeStep from './PersonalizeStep';
import SetupLoadingStep from './SetupLoadingStep';
import AllSetStep from './AllSetStep';

// No API endpoint yet for saving learner preferences (learning goal / interests).
// So this step is UI-only for now - pending when the endpoints are available.

type Step = 'personalize' | 'loading' | 'all-set';

const LOADING_MS = 1400;
const ALL_SET_MS = 1600;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('personalize');

  const handleContinue = () => {
    setStep('loading');
  };

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => setStep('all-set'), LOADING_MS);
      return () => clearTimeout(timer);
    }
    if (step === 'all-set') {
      const timer = setTimeout(() => router.push('/dashboard'), ALL_SET_MS);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  if (step === 'loading') {
    return (
      <AuthStatusScreen>
        <SetupLoadingStep />
      </AuthStatusScreen>
    );
  }

  if (step === 'all-set') {
    return (
      <AuthStatusScreen>
        <AllSetStep />
      </AuthStatusScreen>
    );
  }

  return (
    <AuthWrapper>
      <PersonalizeStep onContinue={handleContinue} />
    </AuthWrapper>
  );
}
