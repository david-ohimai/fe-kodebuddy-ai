'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/layout/AuthWrapper';
import { useToast } from '@/components/ui/ToastProvider';
import SignUpForm from './SignUpForm';
import AccountReadyStep from './AccountReadyStep';
import * as authApi from '@/lib/api/auth.api';
import { ApiError, setAccessToken, setRefreshToken } from '@/lib/api/client';
import type { SignUpFormValues } from '@/types/auth.types';

type Step = 'details' | 'account-ready';

export default function SignUp() {
  const router = useRouter();
  const { showError } = useToast();

  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      await authApi.signUp({ email: values.email, password: values.password });

      const signInRes = await authApi.signIn({
        email: values.email,
        password: values.password,
      });
      setAccessToken(signInRes.accessToken);
      setRefreshToken(signInRes.refreshToken);

      await authApi.updateProfile({ fullName: values.fullName });

      setStep('account-ready');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong creating your account. Please try again.';
      showError('Could not create account', message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'account-ready') {
    return (
      <AuthWrapper>
        <AccountReadyStep onContinue={() => router.push('/onboarding')} />
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper
      title="Create your account"
      subtitle="Start your learning journey with KodeBuddy"
      footerText="Already have an account?"
      footerLink={{ label: 'Sign in', href: '/sign-in' }}
    >
      <SignUpForm loading={loading} onSubmit={handleCreateAccount} />
    </AuthWrapper>
  );
}
