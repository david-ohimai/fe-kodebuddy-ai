'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import AuthWrapper from '@/components/layout/AuthWrapper';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/ToastProvider';
import { signInSchema } from '@/lib/validations/auth.schema';
import * as authApi from '@/lib/api/auth.api';
import {
  getErrorMessage,
  setAccessToken,
  setRefreshToken,
} from '@/lib/api/client';
import type { SignInFormValues } from '@/types/auth.types';
import { ROLE_HOME_HREF } from '@/types/dashboard.types';

export default function SignIn() {
  const router = useRouter();
  const { showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const res = await authApi.signIn({
        email: values.email,
        password: values.password,
      });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      router.push(ROLE_HOME_HREF[res.user.role]);
    } catch (err) {
      const message = getErrorMessage(
        err,
        'Could not sign in. Please check your details and try again.',
      );
      showError('Sign in failed', message);
    }
  };

  return (
    <AuthWrapper
      title="Log in to your account"
      subtitle="Continue your learning journey with KodeBuddy"
      footerText="Don't have an account?"
      footerLink={{ label: 'Sign up', href: '/sign-up' }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
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

        <div className="flex flex-col gap-2">
          <AppInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Link
            href="/forgot-password"
            className="b2-b self-start text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <AppButton
          type="submit"
          fullWidth
          radius="full"
          size="large"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </AppButton>
      </form>
    </AuthWrapper>
  );
}
