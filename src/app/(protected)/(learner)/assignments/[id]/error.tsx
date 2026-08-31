'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';

/**
 * Route-level boundary for the assignment brief.
 *
 * Without one, a render error unmounts the tree and the learner is left
 * looking at a blank page with no way back. This keeps them inside the app,
 * offers a retry, and surfaces the message instead of swallowing it.
 */
export default function AssignmentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[assignment-detail] render failed:', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link
        href="/assignments"
        className="inline-flex w-fit items-center gap-2 b2-m text-primary underline underline-offset-4"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      <AppCard padding="lg">
        <h1 className="h6-b text-text">Something went wrong</h1>
        <p className="b2-r mt-2 text-text-secondary">
          This assignment could not be displayed. Your work is not affected.
        </p>

        <pre className="mt-4 max-h-60 overflow-auto rounded-btn bg-disabled px-4 py-3 f1-r whitespace-pre-wrap text-text-secondary">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ''}
        </pre>

        <AppButton
          className="mt-6"
          radius="full"
          startIcon={<RotateCcw size={16} />}
          onClick={reset}
        >
          Try again
        </AppButton>
      </AppCard>
    </div>
  );
}
