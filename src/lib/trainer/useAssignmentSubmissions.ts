'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import * as submissionsApi from '@/lib/api/submissions.api';
import * as coursesApi from '@/lib/api/courses.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Submission } from '@/lib/api/submissions.api';

export interface SubmissionWithLearner extends Submission {
  learnerName: string | null;
  learnerEmail: string | null;
}

export function useAssignmentSubmissions(
  assignmentId: number,
  courseId: number,
) {
  const { showError, showSuccess } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionWithLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      submissionsApi.listAssignmentSubmissions(assignmentId),
      coursesApi.listCourseLearners(courseId).catch(() => []),
    ])
      .then(([subs, learners]) => {
        const learnerById = new Map(learners.map((l) => [l.learnerId, l]));
        setSubmissions(
          subs
            .map((s) => {
              const learner = learnerById.get(s.learnerId);
              return {
                ...s,
                learnerName: learner?.fullName ?? null,
                learnerEmail: learner?.email ?? null,
              };
            })
            .sort(
              (a, b) =>
                new Date(b.submittedAt).getTime() -
                new Date(a.submittedAt).getTime(),
            ),
        );
      })
      .catch((err) => {
        showError(
          'Could not load submissions',
          getErrorMessage(err, 'Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, courseId]);

  const gradeSubmission = async (
    submission: SubmissionWithLearner,
    data: { score: number; feedback?: string },
  ) => {
    setGrading(true);
    try {
      const updated = await submissionsApi.gradeSubmission(submission.id, data);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? {
                ...updated,
                learnerName: submission.learnerName,
                learnerEmail: submission.learnerEmail,
              }
            : s,
        ),
      );
      showSuccess(
        'Grade saved.',
        `${submission.learnerName || submission.learnerEmail || 'This learner'}'s submission has been graded.`,
      );
    } finally {
      setGrading(false);
    }
  };

  return { submissions, loading, grading, gradeSubmission, refresh: load };
}
