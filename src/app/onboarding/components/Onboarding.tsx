'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/layout/AuthWrapper';
import AuthStatusScreen from '@/components/layout/AuthStatusScreen';
import PersonalizeStep from './PersonalizeStep';
import SetupLoadingStep from './SetupLoadingStep';
import AllSetStep from './AllSetStep';
import { selectCourse } from '@/lib/api/courses.api';
import { joinCohort } from '@/lib/api/cohorts.api';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import type { OnboardingFormValues } from '@/types/auth.types';

function isAlreadyEnrolledError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 409) return true;
  return /already\s+(registered|enrolled|a member|joined)/i.test(err.message);
}

type Step = 'personalize' | 'loading' | 'all-set';

const LOADING_MS = 1400;
const ALL_SET_MS = 1600;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('personalize');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async (values: OnboardingFormValues) => {
    if (!values.cohortId && !values.courseId) {
      setStep('loading');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (values.cohortId) {
        try {
          await joinCohort(values.cohortId);
        } catch (err) {
          if (!isAlreadyEnrolledError(err)) throw err;
        }
      }
      if (values.courseId) {
        await selectCourse(values.courseId);
      }
      setStep('loading');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Could not save your cohort/course. Please try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
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
      <PersonalizeStep
        loading={submitting}
        error={error}
        onContinue={handleContinue}
      />
    </AuthWrapper>
  );
}
