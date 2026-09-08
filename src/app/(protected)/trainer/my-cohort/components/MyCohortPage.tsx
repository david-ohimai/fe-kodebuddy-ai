'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Flag,
  RotateCcw,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppTab from '@/components/ui/AppTab';
import AppTable, { type AppTableColumn } from '@/components/ui/AppTable';
import AppPagination from '@/components/ui/AppPagination';
import AppPill from '@/components/ui/AppPill';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useMyAssignedCourse } from '@/lib/trainer/useMyAssignedCourse';
import {
  useCohortRoster,
  type RosterEntry,
  type RosterTab,
} from '@/lib/trainer/useCohortRoster';
import SendReminderModal from './SendReminderModal';
import noCohorts from '@/assets/images/no-cohorts.webp';

const PAGE_SIZE = 8;

const TABS: { id: RosterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'needs_attention', label: 'Needs attention' },
  { id: 'on_track', label: 'On track' },
];

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

function ProgressBar({
  percent,
  color,
}: {
  percent: number;
  color: 'warning' | 'primary';
}) {
  const barClass = color === 'warning' ? 'bg-warning' : 'bg-primary';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-disabled">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <span className="f1-r text-text-secondary">{percent}%</span>
    </div>
  );
}

export default function MyCohortPage() {
  const { user } = useCurrentUserContext();
  const {
    data,
    cohortWithoutCourse,
    loading: loadingCourse,
  } = useMyAssignedCourse(user?.id);
  const {
    roster,
    loading,
    error,
    retry,
    stats,
    sendingReminder,
    sendReminder,
  } = useCohortRoster(data?.course.id);

  const [activeTab, setActiveTab] = useState<RosterTab>('all');
  const [page, setPage] = useState(1);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return roster;
    return roster.filter((r) => r.status === activeTab);
  }, [roster, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab as RosterTab);
    setPage(1);
  };

  const columns: AppTableColumn<RosterEntry>[] = [
    {
      key: 'learner',
      header: 'Learner',
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
            {(r.fullName || r.email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="b2-m truncate text-text">{r.fullName || '—'}</p>
            <p className="f1-r truncate text-muted">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.status ? (
          <AppPill
            label={
              r.status === 'needs_attention' ? 'Needs attention' : 'On track'
            }
            color={r.status === 'needs_attention' ? 'warning' : 'primary'}
          />
        ) : (
          <span className="b2-r text-muted">—</span>
        ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (r) =>
        r.progressPercentage !== null ? (
          <ProgressBar
            percent={r.progressPercentage}
            color={r.status === 'needs_attention' ? 'warning' : 'primary'}
          />
        ) : (
          <span className="b2-r text-muted">—</span>
        ),
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (r) => (
        <span className="b2-r text-text-secondary">
          {formatDate(r.lastActiveAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <AppButton
          href={`/trainer/my-cohort/${r.learnerId}`}
          variant="text"
          color="neutral"
          size="icon"
          ariaLabel={`View details for ${r.fullName || r.email}`}
          className="h-8 w-8 text-muted hover:bg-primary-light hover:text-primary"
        >
          <ChevronRight size={18} />
        </AppButton>
      ),
    },
  ];

  if (loadingCourse) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title="My Cohort"
          subtitle="Manage the learners in your assigned cohort."
        />
        <AppCard padding="lg">
          <AppEmptyState
            image={noCohorts}
            title={
              cohortWithoutCourse
                ? `${cohortWithoutCourse.name} doesn't have a course yet`
                : 'No cohort assigned yet'
            }
            description={
              cohortWithoutCourse
                ? "You're assigned to this cohort, but learner progress needs a course to measure against — an admin needs to add one first."
                : 'Once an admin assigns you a cohort, its learners will show up here.'
            }
          />
        </AppCard>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      icon: Users,
      label: 'Total learners',
      value: stats.total,
      subtext: 'All learners assigned',
    },
    {
      icon: Flag,
      label: 'Needs attention',
      value: stats.needsAttention,
      subtext: 'Learners',
    },
    {
      icon: CheckCheck,
      label: 'Active',
      value: stats.active,
      subtext: 'Active this week',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="My Cohort"
        subtitle="Manage the learners in your assigned cohort"
        actions={
          <AppButton
            startIcon={<Bell size={16} />}
            radius="full"
            onClick={() => setIsReminderOpen(true)}
          >
            Send reminder
          </AppButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ icon: Icon, label, value, subtext }) => (
          <AppCard key={label} padding="md">
            <AppCard.Icon variant="primary" className="mb-3">
              <Icon />
            </AppCard.Icon>
            <p className="b2-m text-text-secondary">{label}</p>
            <p className="h3-b mt-1 text-text">{value}</p>
            <p className="f1-r mt-1 text-muted">{subtext}</p>
          </AppCard>
        ))}
      </div>

      <AppCard padding="none">
        <AppTab
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleSelectTab}
          variant="underline"
          className="px-4 pt-2"
        />

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : error ? (
          <AppEmptyState
            title="Could not load your cohort"
            description={error}
            actionLabel="Retry"
            actionIcon={<RotateCcw size={16} />}
            onAction={retry}
          />
        ) : filtered.length === 0 ? (
          <AppEmptyState
            title="No learners here yet"
            description={
              activeTab === 'all'
                ? 'Learners assigned to your cohort will show up here.'
                : 'No learners currently match this filter.'
            }
          />
        ) : (
          <>
            <AppTable
              columns={columns}
              data={paged}
              getRowKey={(r) => r.learnerId}
            />
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              onChange={setPage}
              className="my-6"
            />
          </>
        )}
      </AppCard>

      <SendReminderModal
        open={isReminderOpen}
        saving={sendingReminder}
        onClose={() => setIsReminderOpen(false)}
        onSend={sendReminder}
      />
    </div>
  );
}
