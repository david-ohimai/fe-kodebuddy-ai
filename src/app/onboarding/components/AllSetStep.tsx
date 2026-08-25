import React from 'react';
import Image from 'next/image';
import onboardingCompleteIcon from '@/assets/images/account-ready.webp';

export default function AllSetStep() {
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <Image
          src={onboardingCompleteIcon}
          alt=""
          fill
          className="object-contain"
        />
      </span>

      <h1 className="h5-b text-text">You&apos;re all set</h1>
    </div>
  );
}
