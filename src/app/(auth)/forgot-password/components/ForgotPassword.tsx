'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import AuthWrapper from '@/components/layout/AuthWrapper';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/ToastProvider';
import { forgotPasswordSchema } from '@/lib/validations/auth.schema';
import * as authApi from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/client';
import type { ForgotPasswordFormValues } from '@/types/auth.types';
import resetPasswordIllustration from '@/assets/images/reset-password.webp';

export default function ForgotPassword() {
  const { showError } = useToast();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authApi.forgotPassword(values);
      setSubmittedEmail(values.email);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not send the reset link. Please try again.';
      showError('Something went wrong', message);
    }
  };

  if (submittedEmail) {
    return (
      <AuthWrapper
        footerText="Remember your password?"
        footerLink={{ label: 'Log in', href: '/sign-in' }}
        leftPanel="image"
        leftImage={resetPasswordIllustration}
        leftImageAlt="A learner unlocking their account securely"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <Mail size={28} className="text-primary" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="h5-b text-text">Check your inbox</h1>
            <p className="b2-r mt-2 text-text-secondary">
              We&apos;ve sent a password reset link to {submittedEmail}. Open it
              to create a new password.
            </p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper
      title="Reset your password"
      subtitle="Please enter the email address associated with your account"
      footerText="Remember your password?"
      footerLink={{ label: 'Log in', href: '/sign-in' }}
      leftPanel="image"
      leftImage={resetPasswordIllustration}
      leftImageAlt="A learner unlocking their account securely"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        <AppInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AppButton
          type="submit"
          fullWidth
          radius="full"
          size="large"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Please wait...' : 'Next'}
        </AppButton>
      </form>
    </AuthWrapper>
  );
}
