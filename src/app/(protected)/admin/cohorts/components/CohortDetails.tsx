'use client';

import React from 'react';
import { ArrowLeft, Pencil, User, Users, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import { AppCard } from '@/components/ui/AppCard';

export interface CohortDetails {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
  totalLearners: number;
  trainer?: string;
  trainerEmail?: string;
  course?: string;
}

interface CohortDetailsViewProps {
  cohort: CohortDetails;
  onBack: () => void;
  onEditCohort?: () => void;
  onViewLearners?: () => void;
  onChangeTrainer?: () => void;
  onChangeCourse?: () => void;
  onChangeStatus?: () => void;
}

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const actionButtonClass =
  'w-36 border-primary text-primary hover:bg-button-hover! hover:border-button-hover! hover:text-white! transition-colors';

const DetailListItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  value: React.ReactNode;
  actionLabel: string;
  onAction?: () => void;
}> = ({ icon, title, description, value, actionLabel, onAction }) => (
  <div className="flex items-center justify-between gap-4 border-b border-disabled px-6 py-5 last:border-b-0">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon}
      </span>
      <div>
        <p className="b1-b text-text">{title}</p>
        <p className="b2-r mt-0.5 text-muted">{description}</p>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <span className="b1-b hidden text-text sm:block">{value}</span>
      <AppButton
        size="small"
        radius="full"
        variant="outlined"
        color="primary"
        endIcon={<ChevronRight size={14} />}
        className={actionButtonClass}
        onClick={onAction}
      >
        {actionLabel}
      </AppButton>
    </div>
  </div>
);

const CohortDetailsView: React.FC<CohortDetailsViewProps> = ({
  cohort,
  onBack,
  onEditCohort,
  onViewLearners,
  onChangeTrainer,
  onChangeCourse,
  onChangeStatus,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 b2-b text-primary"
      >
        <ArrowLeft size={16} />
        Back to cohorts
      </button>

      <AppCard padding="none">
        <div className="flex items-start justify-between border-b border-disabled px-6 py-5">
          <div>
            <h2 className="h5-b text-text">Cohort details</h2>
            <p className="b2-r mt-1 text-muted">
              View and manage the details of this cohort.
            </p>
          </div>
          <AppButton
            variant="outlined"
            color="primary"
            radius="full"
            size="small"
            startIcon={<Pencil size={14} />}
            className={actionButtonClass}
            onClick={onEditCohort}
          >
            Edit cohort
          </AppButton>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-card border border-disabled p-5">
            <div className="flex items-center gap-3">
              <h3 className="h6-b text-text">{cohort.name}</h3>
              <AppPill
                label={cohort.status === 'active' ? 'Active' : 'Inactive'}
                color={cohort.status === 'active' ? 'success' : 'default'}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="f1-r text-muted">Start date</p>
                <p className="b1-b mt-1 text-text">{formatDate(cohort.startDate)}</p>
              </div>
              <div>
                <p className="f1-r text-muted">End date</p>
                <p className="b1-b mt-1 text-text">{formatDate(cohort.endDate)}</p>
              </div>
              <div>
                <p className="f1-r text-muted">Total learners</p>
                <p className="b1-b mt-1 text-text">{cohort.totalLearners}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-disabled">
          <DetailListItem
            icon={<User size={16} />}
            title="Learners"
            description={`${cohort.totalLearners} learners enrolled in this cohort`}
            value={cohort.totalLearners}
            actionLabel="View learners"
            onAction={onViewLearners}
          />

          <DetailListItem
            icon={<Users size={16} />}
            title="Assigned trainer"
            description={cohort.trainerEmail ?? 'No trainer assigned yet'}
            value={cohort.trainer ?? 'Not assigned'}
            actionLabel="Change trainer"
            onAction={onChangeTrainer}
          />

          <DetailListItem
            icon={<BookOpen size={16} />}
            title="Assigned course"
            description="Course assigned to this cohort"
            value={cohort.course ?? 'Not assigned'}
            actionLabel="Change course"
            onAction={onChangeCourse}
          />

          <DetailListItem
            icon={<GraduationCap size={16} />}
            title="Cohort status"
            description={
              cohort.status === 'active'
                ? 'This cohort is currently active and learners can access course content and resources.'
                : 'This cohort is inactive — learners cannot access course content or resources.'
            }
            value={
              <AppPill
                label={cohort.status === 'active' ? 'Active' : 'Inactive'}
                color={cohort.status === 'active' ? 'success' : 'default'}
              />
            }
            actionLabel="Change status"
            onAction={onChangeStatus}
          />
        </div>
      </AppCard>
    </div>
  );
};

export default CohortDetailsView;
