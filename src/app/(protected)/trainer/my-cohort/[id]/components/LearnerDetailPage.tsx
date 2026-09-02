'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckSquare,
  FileClock,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import CircularProgress from '@/components/course/CircularProgress';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import { useLearnerDetail } from '@/lib/trainer/useLearnerDetail';
import { useCourseContent } from '@/lib/courses/useCourseContent';
import { useCourseResources } from '@/lib/trainer/useCourseResources';
import RecommendResourcePicker from './RecommendResourcePicker';
import RecommendResourceModal from './RecommendResourceModal';
import SendCheckInModal from './SendCheckInModal';
import type { CourseResource } from '@/lib/api/resources.api';

export interface LearnerDetailPageProps {
  learnerId: number;
}

const STATUS_THRESHOLD = 50;

function firstName(fullName: string | null, email: string) {
  return (fullName?.trim().split(' ')[0] || email.split('@')[0]) ?? 'Learner';
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LearnerDetailPage({
  learnerId,
}: LearnerDetailPageProps) {
  const { user } = useCurrentUserContext();
  const { data: courseData, loading: loadingCourse } = useMyAssignedCourse(
    user?.id,
  );
  const content = useCourseContent(courseData?.course.id ?? 0);
  const { identity, detail, loading, sending, sendCheckIn, recommendResource } =
    useLearnerDetail(
      courseData?.cohort.id,
      courseData?.course.id,
      content.modules,
      learnerId,
    );
  const resourcesState = useCourseResources(content.modules);

  const [view, setView] = useState<'overview' | 'recommend'>('overview');
  const [selectedResource, setSelectedResource] =
    useState<CourseResource | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  if (loadingCourse || loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/trainer/my-cohort"
          className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to Learner List
        </Link>
        <AppCard padding="lg">
          <AppEmptyState
            title="Learner not found"
            description="This learner may no longer be in your cohort."
          />
        </AppCard>
      </div>
    );
  }

  const name = identity.fullName || identity.email;
  const fname = firstName(identity.fullName, identity.email);
  const needsAttention =
    detail?.progressPercentage !== null &&
    detail?.progressPercentage !== undefined &&
    detail.progressPercentage < STATUS_THRESHOLD;
  const moduleOrderById = new Map(content.modules.map((m) => [m.id, m.order]));

  if (view === 'recommend') {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setView('overview')}
          className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to Learner
        </button>

        <AppCard padding="none">
          <div className="flex items-center gap-3 border-b border-disabled p-5 sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light b1-b text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="b1-b text-text">{name}</p>
              <div className="mt-1 flex items-center gap-2">
                {needsAttention && (
                  <AppPill label="Needs attention" color="warning" />
                )}
                <span className="f1-r text-muted">Learner</span>
              </div>
            </div>
          </div>

          <RecommendResourcePicker
            resources={resourcesState.resources}
            modules={content.modules}
            loading={resourcesState.loading}
            selectedId={selectedResource?.id ?? null}
            onSelect={setSelectedResource}
            onCancel={() => setView('overview')}
            onNext={() => setIsConfirmOpen(true)}
          />
        </AppCard>

        <RecommendResourceModal
          open={isConfirmOpen}
          resource={selectedResource}
          moduleOrder={
            selectedResource
              ? (moduleOrderById.get(selectedResource.moduleId) ?? null)
              : null
          }
          learnerFirstName={fname}
          saving={sending}
          onClose={() => setIsConfirmOpen(false)}
          onSend={async (note) => {
            if (!selectedResource) return;
            await recommendResource(selectedResource.title, note || undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/trainer/my-cohort"
        className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to Learner List
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light h5-b text-primary">
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="h5-b text-text">{name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {needsAttention && (
                <AppPill label="Needs attention" color="warning" />
              )}
              <span className="b2-r text-muted">Learner</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton
            variant="outlined"
            radius="full"
            onClick={() => {
              setSelectedResource(null);
              setView('recommend');
            }}
          >
            Recommend a resource
          </AppButton>
          <AppButton
            radius="full"
            startIcon={<Upload size={16} />}
            onClick={() => setIsCheckInOpen(true)}
          >
            Send check in
          </AppButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AppCard padding="md">
          <AppCard.Icon variant="primary" className="mb-3">
            <TrendingUp />
          </AppCard.Icon>
          <p className="b2-m text-text-secondary">Overall Progress</p>
          {detail?.progressPercentage !== null &&
          detail?.progressPercentage !== undefined ? (
            <div className="mt-2 flex items-center gap-3">
              <CircularProgress percent={detail.progressPercentage} size={56} />
              <span className="h3-b text-text">
                {detail.progressPercentage}%{' '}
                <span className="b2-r text-muted">completed</span>
              </span>
            </div>
          ) : (
            <p className="h3-b mt-2 text-muted">—</p>
          )}
        </AppCard>

        <AppCard padding="md">
          <AppCard.Icon variant="primary" className="mb-3">
            <FileClock />
          </AppCard.Icon>
          <p className="b2-m text-text-secondary">Last submission</p>
          <p className="h3-b mt-1 text-text">
            {formatDate(detail?.lastSubmissionAt ?? null)}
          </p>
          <p className="f1-r mt-1 text-muted">
            Most recent assignment turned in
          </p>
        </AppCard>

        <AppCard padding="md">
          <AppCard.Icon variant="primary" className="mb-3">
            <CheckSquare />
          </AppCard.Icon>
          <p className="b2-m text-text-secondary">Check ins</p>
          <p className="h3-b mt-1 text-text">{detail?.checkInCount ?? '—'}</p>
          <p className="f1-r mt-1 text-muted">Sent so far</p>
        </AppCard>
      </div>

      <AppCard padding="lg">
        <h2 className="b1-b text-text">Progress by module</h2>

        {!detail || detail.progressByModule.length === 0 ? (
          <p className="b2-r mt-4 text-muted">
            No module progress available for this learner yet.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {detail.progressByModule.map((m) => {
              const percent = m.progressPercentage;
              const isComplete = percent !== null && percent >= 100;
              return (
                <div
                  key={m.moduleId}
                  className="rounded-card border border-disabled p-4"
                >
                  <p className="b2-b text-text">{m.moduleTitle}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="f1-r text-muted">
                      {percent === null
                        ? '—'
                        : isComplete
                          ? 'Completed'
                          : `${percent}% complete`}
                    </span>
                    <span className="f1-r text-muted">Current progress</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-disabled">
                    <div
                      className={`h-full rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${Math.max(percent ?? 0, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppCard>

      <AppCard padding="none">
        <div className="flex items-center justify-between border-b border-disabled p-5 sm:p-6">
          <h2 className="b1-b text-text">Recent Activity</h2>
        </div>

        {!detail || detail.recentActivity.length === 0 ? (
          <p className="b2-r p-5 text-muted sm:p-6">
            No activity logged for this learner yet.
          </p>
        ) : (
          <ul className="divide-y divide-disabled">
            {detail.recentActivity.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6"
              >
                <div>
                  <p className="b2-m text-text">{activity.title}</p>
                  {activity.description && (
                    <p className="f1-r text-muted">{activity.description}</p>
                  )}
                </div>
                <span className="f1-r text-muted">
                  {new Date(activity.createdAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AppCard>

      <SendCheckInModal
        open={isCheckInOpen}
        learnerFirstName={fname}
        saving={sending}
        onClose={() => setIsCheckInOpen(false)}
        onSend={sendCheckIn}
      />
    </div>
  );
}
