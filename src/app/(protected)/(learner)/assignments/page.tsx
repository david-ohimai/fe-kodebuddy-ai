'use client';

import React, { useState } from 'react';

import AppPageHeader from '@/components/ui/AppPageHeader';

import {
  AssignmentsList,
  type AssignmentItem,
} from './components/AssignmentsList';

export default function AssignmentsPage() {
  // Empty for now because the backend is not stable yet.
  // We will connect the real API here later.
  const [assignments] = useState<AssignmentItem[]>([]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <AppPageHeader
        title="Assignments"
        subtitle="Here's what's happening on KodeBuddy today."
      />

      <AssignmentsList
        assignments={assignments}
      />
    </div>
  );
}
  