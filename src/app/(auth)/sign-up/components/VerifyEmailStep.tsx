'use client';

// This is currently wired into the live sign-up flow;
// But the Backend has no email-verification/OTP endpoint yet.

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AppOtpInput from '@/components/ui/AppOtpInput';
import AppButton from '@/components/ui/AppButton';
import { OTP_LENGTH } from '@/lib/validations/auth.schema';
import verifyEmailIcon from '@/assets/images/verify-email.webp';

export interface VerifyEmailStepProps {
  email: string;
  loading?: boolean;
  error?: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  resendCooldownSeconds?: number;
}

export default function VerifyEmailStep({
  email,
  loading = false,
  error,
  onVerify,
  onResend,
  onChangeEmail,
  resendCooldownSeconds = 30,
}: VerifyEmailStepProps) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0) return;
    onResend();
    setCooldown(resendCooldownSeconds);
  };

  const isComplete = code.length === OTP_LENGTH;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <Image src={verifyEmailIcon} alt="" fill className="object-contain" />
      </span>

      <div>
        <h1 className="h5-b text-text">Verify your email</h1>
        <p className="b2-r mt-2 text-text-secondary">
          We&apos;ve sent a verification code to {email || 'your email address'}
          .
        </p>
      </div>

      <AppOtpInput
        length={OTP_LENGTH}
        value={code}
        onChange={setCode}
        error={error}
        disabled={loading}
        autoFocus
      />

      <p className="b2-r text-text-secondary">
        Didn&apos;t receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="b2-b text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          Resend code
        </button>
        {cooldown > 0 && <span className="text-muted"> ({cooldown}s)</span>}.
      </p>

      <AppButton
        type="button"
        fullWidth
        radius="full"
        size="large"
        loading={loading}
        disabled={!isComplete || loading}
        onClick={() => onVerify(code)}
      >
        {loading ? 'Verifying...' : 'Verify code'}
      </AppButton>

      <button
        type="button"
        onClick={onChangeEmail}
        className="b2-b text-primary hover:underline"
      >
        Change email address
      </button>
    </div>
  );
}
