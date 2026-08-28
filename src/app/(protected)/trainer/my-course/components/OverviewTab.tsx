import React from 'react';
import { BookOpen, FileText, ClipboardList, Users, TrendingUp } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';

export interface OverviewTabProps {
  moduleCount: number;
  learningContentCount: number;
  assignmentCount: number;
  learnerCount: number;
  completionPercent: number;
}

const STAT_ICON_VARIANT = {
  modules: 'primary',
  content: 'success',
  assignments: 'warning',
  learners: 'default',
} as const;

export default function OverviewTab({
  moduleCount,
  learningContentCount,
  assignmentCount,
  learnerCount,
  completionPercent,
}: OverviewTabProps) {
  const stats = [
    { icon: BookOpen, variant: STAT_ICON_VARIANT.modules, value: moduleCount, label: 'Modules' },
    { icon: FileText, variant: STAT_ICON_VARIANT.content, value: learningContentCount, label: 'Learning content' },
    { icon: ClipboardList, variant: STAT_ICON_VARIANT.assignments, value: assignmentCount, label: 'Assignments' },
    { icon: Users, variant: STAT_ICON_VARIANT.learners, value: learnerCount, label: 'Learners' },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6">
      <div>
        <p className="b2-b text-text">Course overview</p>
        <p className="f1-r text-muted">A quick summary of your course content and learners.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ icon: Icon, variant, value, label }) => (
          <AppCard key={label} padding="md">
            <AppCard.Icon variant={variant} className="mb-3">
              <Icon />
            </AppCard.Icon>
            <p className="h4-b text-text">{value}</p>
            <p className="f1-r text-muted">{label}</p>
          </AppCard>
        ))}
      </div>

      <AppCard padding="md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AppCard.Icon variant="primary">
              <TrendingUp />
            </AppCard.Icon>
            <div>
              <p className="b2-b text-text">Learning progress summary</p>
              <p className="f1-r text-muted">
                Overall progress in your assigned cohort.
              </p>
            </div>
          </div>
          <AppButton
            href="/trainer/my-cohort"
            variant="outlined"
            radius="full"
            size="small"
            className="shrink-0"
          >
            View cohort progress
          </AppButton>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-disabled">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="b1-b shrink-0 text-text">
            {completionPercent}%{' '}
            <span className="f1-r font-normal text-muted">
              Overall progress
            </span>
          </p>
        </div>
      </AppCard>
    </div>
  );
}
