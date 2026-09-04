'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as cohortsApi from '@/lib/api/cohorts.api';
import * as mentorsApi from '@/lib/api/mentors.api';
import * as activityApi from '@/lib/api/activity.api';
import { getErrorMessage } from '@/lib/api/client';
import type { CohortLearner } from '@/lib/api/cohorts.api';
import type { CourseModule } from '@/lib/api/modules.api';
import type { ActivityEntry } from '@/lib/api/activity.api';

export interface ModuleProgressSummary {
  moduleId: number;
  moduleTitle: string;
  order: number;
  progressPercentage: number | null;
}

export interface LearnerDetail {
  progressPercentage: number | null;
  checkInCount: number;
  lastSubmissionAt: string | null;
  progressByModule: ModuleProgressSummary[];
  recentActivity: ActivityEntry[];
}

export function useLearnerDetail(
  cohortId: number | undefined,
  courseId: number | undefined,
  modules: CourseModule[],
  learnerId: number,
) {
  const { showError } = useToast();
  const [identity, setIdentity] = useState<CohortLearner | null>(null);
  const [detail, setDetail] = useState<LearnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const moduleIds = modules.map((m) => m.id).join(',');

  const loadLearner = () => {
    if (!cohortId || !courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    Promise.all([
      cohortsApi.listCohortLearners(cohortId),
      mentorsApi
        .getLearnerCourseProgress(learnerId, courseId)
        .then((p) => p.completionPercentage)
        .catch(() => null),
      mentorsApi.listLearnerCheckIns(learnerId).catch(() => []),
      mentorsApi.listLearnerSubmissions(learnerId).catch(() => []),
      activityApi.listTrainerActivity(100).catch(() => []),
      Promise.all(
        modules.map((m) =>
          mentorsApi
            .getLearnerModuleProgress(learnerId, m.id)
            .then((p) => ({
              moduleId: m.id,
              moduleTitle: m.title,
              order: m.order,
              progressPercentage: p.completionPercentage,
            }))
            .catch((): ModuleProgressSummary => ({
              moduleId: m.id,
              moduleTitle: m.title,
              order: m.order,
              progressPercentage: null,
            })),
        ),
      ),
    ])
      .then(
        ([
          learners,
          progressPercentage,
          checkIns,
          submissions,
          activity,
          progressByModule,
        ]) => {
          setIdentity(learners.find((l) => l.learnerId === learnerId) ?? null);

          const lastSubmissionAt = submissions.reduce<string | null>(
            (latest, s) =>
              !latest || s.submittedAt > latest ? s.submittedAt : latest,
            null,
          );

          setDetail({
            progressPercentage,
            checkInCount: checkIns.length,
            lastSubmissionAt,
            progressByModule: progressByModule.sort(
              (a, b) => a.order - b.order,
            ),
            recentActivity: activity
              .filter((a) => a.userId === learnerId)
              .slice(0, 10),
          });
        },
      )
      .catch((err) => {
        showError(
          'Could not load this learner',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLearner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortId, courseId, learnerId, moduleIds]);

  const sendCheckIn = async (message: string) => {
    setSending(true);
    try {
      await mentorsApi.createCheckIn({
        learnerId,
        scheduledTime: new Date().toISOString(),
        notes: message,
      });
    } finally {
      setSending(false);
    }
  };

  const recommendResource = async (resourceTitle: string, note?: string) => {
    setSending(true);
    try {
      const notes =
        `Recommended resource: ${resourceTitle}${note ? `\n\n${note}` : ''}`.slice(
          0,
          1000,
        );
      await mentorsApi.createCheckIn({
        learnerId,
        scheduledTime: new Date().toISOString(),
        notes,
      });
    } finally {
      setSending(false);
    }
  };

  return {
    identity,
    detail,
    loading,
    sending,
    sendCheckIn,
    recommendResource,
  };
}
