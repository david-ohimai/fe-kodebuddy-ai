'use client';

import React from 'react';
import Image from 'next/image';
import AppButton from '@/components/ui/AppButton';
import accountReadyIcon from '@/assets/images/account-ready.webp';

export interface AccountReadyStepProps {
  onContinue: () => void;
}

export default function AccountReadyStep({
  onContinue,
}: AccountReadyStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <Image src={accountReadyIcon} alt="" fill className="object-contain" />
      </span>

      <div>
        <h1 className="h5-b text-text">Your account is ready!</h1>
        <p className="b2-r mt-2 text-text-secondary">
          Welcome to KodeBuddy. Let&apos;s get you started with your learning
          journey.
        </p>
      </div>

      <AppButton fullWidth radius="full" size="large" onClick={onContinue}>
        Continue
      </AppButton>
    </div>
  );
}
