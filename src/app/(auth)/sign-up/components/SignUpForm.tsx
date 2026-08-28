'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail } from 'lucide-react';
import Link from 'next/link';
import AppInput from '@/components/ui/AppInput';
import AppCheckbox from '@/components/ui/AppCheckbox';
import AppButton from '@/components/ui/AppButton';
import PasswordStrengthChecklist from '@/components/ui/PasswordStrengthChecklist';
import { signUpSchema } from '@/lib/validations/auth.schema';
import type { SignUpFormValues } from '@/types/auth.types';

export interface SignUpFormProps {
  defaultValues?: Partial<SignUpFormValues>;
  loading?: boolean;
  onSubmit: (values: SignUpFormValues) => void;
}

export default function SignUpForm({
  defaultValues,
  loading = false,
  onSubmit,
}: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      ...defaultValues,
    },
  });

  const password = watch('password') ?? '';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <AppInput
        label="Full name"
        icon={User}
        placeholder="Enter your name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <AppInput
        label="Email"
        icon={Mail}
        type="email"
        placeholder="Enter your email address"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1.5">
        <AppInput
          label="Create password"
          type="password"
          placeholder="Create your password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {password.length > 0 && (
          <PasswordStrengthChecklist password={password} className="pt-1" />
        )}
      </div>

      <AppInput
        label="Confirm password"
        type="password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <AppCheckbox
        label={
          <>
            I agree to the{' '}
            <Link
              href="/terms-of-service"
              className="b2-b text-primary hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              className="b2-b text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </>
        }
        error={errors.agreeToTerms?.message}
        {...register('agreeToTerms')}
      />

      <AppButton
        type="submit"
        fullWidth
        radius="full"
        size="large"
        loading={loading}
        disabled={!isValid || loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </AppButton>
    </form>
  );
}
