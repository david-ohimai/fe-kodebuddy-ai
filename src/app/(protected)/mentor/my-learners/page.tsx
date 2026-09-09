'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSpinner from '@/components/ui/AppSpinner';
import * as mentorsApi from '@/lib/api/mentors.api';
import MyLearnersPage, { type Learner } from './components/MyLearnersPage';

function toDisplayLearner(apiLearner: mentorsApi.AssignedLearner): Learner {
  const lastActive = apiLearner.assignedAt
    ? new Date(apiLearner.assignedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return {
    id: String(apiLearner.learnerId),
    name: apiLearner.fullName || 'Learner',
    email: apiLearner.email,
    status: 'on-track',
    module: 'Assigned learner',
    progress: 0,
    lastActive,
  };
}

export default function MentorMyLearnersPage() {
  const router = useRouter();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    mentorsApi
      .listMyAssignedLearners()
      .then((apiLearners) => {
        if (cancelled) return;
        setLearners(apiLearners.map(toDisplayLearner));
      })
      .catch(() => {
        if (!cancelled) setLearners([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRowClick = (learner: Learner) => {
    router.push(`/mentor/my-learners/${learner.id}`);
  };

  const pageTitle = useMemo(
    () => `${learners.length} Learners assigned to you`,
    [learners.length],
  );

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  return (
    <MyLearnersPage
      learners={learners}
      onRowClick={handleRowClick}
      mentorName={pageTitle}
    />
  );
}
