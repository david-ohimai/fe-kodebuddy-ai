'use client';

import React from 'react';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Users,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
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
  trainers: { id: number; name: string; email: string }[];
  courses: { id: number; title: string }[];
}

interface CohortDetailsViewProps {
  cohort: CohortDetails;
  onBack: () => void;
  onEditCohort?: () => void;
  onDeleteCohort?: () => void;
  onViewLearners?: () => void;
  onAddLearners?: () => void;
  onViewTrainers?: () => void;
  onAssignTrainerToCourse?: () => void;
  onEditCourse?: () => void;
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
  menu?: Array<{ label: string; onSelect?: () => void }>;
}> = ({ icon, title, description, value, actionLabel, onAction, menu }) => {
  const [open, setOpen] = React.useState(false);

  return (
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

        {menu ? (
          <div className="relative">
            <AppButton
              size="small"
              radius="full"
              variant="outlined"
              color="primary"
              endIcon={<ChevronDown size={14} />}
              className={actionButtonClass}
              onClick={() => setOpen((v) => !v)}
            >
              {actionLabel}
            </AppButton>

            {open && (
              <>
                <div
                  role="presentation"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-card border border-disabled bg-background py-1.5 shadow-lg"
                >
                  {menu.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false);
                        item.onSelect?.();
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-left b2-m text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

const CohortDetailsView: React.FC<CohortDetailsViewProps> = ({
  cohort,
  onBack,
  onEditCohort,
  onDeleteCohort,
  onViewLearners,
  onAddLearners,
  onViewTrainers,
  onAssignTrainerToCourse,
  onEditCourse,
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
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-disabled px-6 py-5">
          <div>
            <h2 className="h5-b text-text">Cohort details</h2>
            <p className="b2-r mt-1 text-muted">
              View and manage the details of this cohort.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AppButton
              variant="outlined"
              color="error"
              radius="full"
              size="small"
              startIcon={<Trash2 size={14} />}
              onClick={onDeleteCohort}
            >
              Delete cohort
            </AppButton>
            <AppButton
              variant="outlined"
              color="primary"
              radius="full"
              size="small"
              startIcon={<Pencil size={14} />}
              onClick={onEditCohort}
            >
              Edit cohort
            </AppButton>
          </div>
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
                <p className="b1-b mt-1 text-text">
                  {formatDate(cohort.startDate)}
                </p>
              </div>
              <div>
                <p className="f1-r text-muted">End date</p>
                <p className="b1-b mt-1 text-text">
                  {formatDate(cohort.endDate)}
                </p>
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
            actionLabel="Learners"
            onAction={onViewLearners}
            menu={[
              { label: 'View learners', onSelect: onViewLearners },
              { label: 'Add learners to course', onSelect: onAddLearners },
            ]}
          />

          <DetailListItem
            icon={<Users size={16} />}
            title="Trainers"
            description={
              cohort.trainers.length === 0
                ? 'No trainers assigned yet'
                : `${cohort.trainers.length} trainer${cohort.trainers.length === 1 ? '' : 's'} assigned to this cohort`
            }
            value={cohort.trainers.length}
            actionLabel="Trainers"
            onAction={onViewTrainers}
            menu={[
              { label: 'View trainers', onSelect: onViewTrainers },
              {
                label: 'Assign trainers to course',
                onSelect: onAssignTrainerToCourse,
              },
            ]}
          />

          <DetailListItem
            icon={<BookOpen size={16} />}
            title="Courses"
            description={
              cohort.courses.length === 0
                ? 'No courses assigned yet'
                : `${cohort.courses.length} course${cohort.courses.length === 1 ? '' : 's'} assigned to this cohort`
            }
            value={
              cohort.courses.length === 0
                ? 'Not assigned'
                : cohort.courses.length === 1
                  ? cohort.courses[0].title
                  : `${cohort.courses.length} courses`
            }
            actionLabel="Edit course"
            onAction={onEditCourse}
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
