import { z } from 'zod';

const EMAIL_MESSAGE = 'Enter a valid email address';

export const emailField = z
  .string()
  .min(1, 'Email is required')
  .email(EMAIL_MESSAGE);

export const passwordRules = [
  {
    id: 'length',
    label: 'At least 8 character long',
    test: (value: string) => value.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'One lowercase character',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'One uppercase character',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'numberOrSymbol',
    label: 'One number, symbol, or whitespace character',
    test: (value: string) => /[0-9\W_\s]/.test(value),
  },
] as const;

export const passwordField = z
  .string()
  .min(1, 'Password is required')
  .refine((value) => passwordRules.every((rule) => rule.test(value)), {
    message: 'Password does not meet all requirements',
  });

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const OTP_LENGTH = 6;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
    .regex(/^\d+$/, 'Code must contain numbers only'),
});

export const onboardingSchema = z.object({
  learningGoal: z.string().min(1, 'Select a learning goal'),
  interests: z.array(z.string()).default([]),
});
