'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import AuthWrapper from '@/components/layout/AuthWrapper';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import PasswordStrengthChecklist from '@/components/ui/PasswordStrengthChecklist';
import { useToast } from '@/components/ui/ToastProvider';
import { resetPasswordSchema } from '@/lib/validations/auth.schema';
import * as authApi from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/client';
import type { ResetPasswordFormValues } from '@/types/auth.types';
import resetPasswordIllustration from '@/assets/images/reset-password.webp';

export interface ResetPasswordProps {
  token?: string;
}

export default function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password') ?? '';

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;
    try {
      await authApi.resetPassword({ token, newPassword: values.password });
      showSuccess(
        'Password updated',
        'Your password has been reset. Please log in with your new password.',
      );
      router.push('/sign-in');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not reset your password. Please try again.';
      showError('Something went wrong', message);
    }
  };

  if (!token) {
    return (
      <AuthWrapper
        leftPanel="image"
        leftImage={resetPasswordIllustration}
        leftImageAlt="A learner unlocking their account securely"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="h5-b text-text">Link expired or invalid</h1>
            <p className="b2-r mt-2 text-text-secondary">
              This password reset link is missing or no longer valid. Request a
              new one to continue.
            </p>
          </div>
          <Link href="/forgot-password" className="w-full">
            <AppButton fullWidth radius="full" size="large">
              Request a new link
            </AppButton>
          </Link>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper
      title="Create a new password"
      subtitle="Please create a new password for your account"
      leftPanel="image"
      leftImage={resetPasswordIllustration}
      leftImageAlt="A learner unlocking their account securely"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <AppInput
            label="New password"
            type="password"
            placeholder="create password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {password.length > 0 && (
            <PasswordStrengthChecklist password={password} className="pt-1" />
          )}
        </div>

        <AppInput
          label="Confirm new password"
          type="password"
          placeholder="create password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <AppButton
          type="submit"
          fullWidth
          radius="full"
          size="large"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </AppButton>
      </form>
    </AuthWrapper>
  );
}
