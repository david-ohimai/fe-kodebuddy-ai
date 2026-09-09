'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppSpinner from '@/components/ui/AppSpinner';
import * as mentorsApi from '@/lib/api/mentors.api';
import LearnerDetailPage, {
  type LearnerDetailData,
} from '../components/LearnerDetailPage';

function toDetailLearner(
  apiLearner: mentorsApi.AssignedLearner,
): LearnerDetailData {
  const fallbackName = apiLearner.fullName || apiLearner.email || 'Learner';

  return {
    id: String(apiLearner.learnerId),
    name: fallbackName,
    role: 'Learner',
    status: 'on-track',
    overallProgressPercent: 0,
    daysSinceLastActivity: 0,
    checkInsSentCount: 0,
    modules: [
      {
        id: 'assigned-learner-module',
        title: 'Assigned learner progress',
        statusLabel: 'Awaiting learner activity',
        progress: 0,
      },
    ],
    recentActivity: [
      {
        id: 'assigned-learner-activity',
        text: `${fallbackName} has been assigned to your learner list.`,
        timestamp: 'Today',
      },
    ],
  };
}

export default function MentorLearnerDetailPage() {
  const params = useParams<{ id: string }>();
  const learnerId = Number(params?.id);
  const [learner, setLearner] = useState<LearnerDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!Number.isInteger(learnerId)) {
        setLearner(null);
        setLoading(false);
        return;
      }

      try {
        const assignedLearners = await mentorsApi.listMyAssignedLearners();
        if (cancelled) return;

        const matchedLearner = assignedLearners.find(
          (item) => Number(item.learnerId) === learnerId,
        );

        setLearner(matchedLearner ? toDetailLearner(matchedLearner) : null);
      } catch {
        if (!cancelled) setLearner(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [learnerId]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="rounded-card bg-background p-6">
        <p className="b1-b text-text">Learner not found</p>
        <p className="b2-r mt-2 text-muted">
          This learner may no longer be assigned to you.
        </p>
      </div>
    );
  }

  return <LearnerDetailPage learner={learner} backHref="/mentor/my-learners" />;
}
