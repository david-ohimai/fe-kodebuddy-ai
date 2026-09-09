'use client';

import React, { useMemo, useState } from 'react';
import { ChevronRight, Download, Users } from 'lucide-react';
import AppPageHeader from '@/components/ui/AppPageHeader';
import AppTable, { AppTableColumn } from '@/components/ui/AppTable';
import AppProgressBar from '@/components/ui/AppProgressBar';
import AppButton from '@/components/ui/AppButton';

export interface Learner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'needs-attention' | 'on-track';
  module: string;
  progress: number; // 0-100
  lastActive: string;
}

type TabKey = 'all' | 'needs-attention' | 'on-track';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'needs-attention', label: 'Needs attention' },
  { key: 'on-track', label: 'On track' },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const CELL_EMPHASIS = 'font-semibold text-base leading-normal tracking-normal';

function StatusBadge({ status }: { status: Learner['status'] }) {
  const isNeedsAttention = status === 'needs-attention';
  return (
    <span
      className={cx(
        CELL_EMPHASIS,
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1',
        isNeedsAttention
          ? 'bg-warning-light text-warning-dark'
          : 'bg-primary-light text-primary',
      )}
    >
      {isNeedsAttention ? 'Needs attention' : 'On track'}
    </span>
  );
}

function ProgressCell({
  value,
  status,
}: {
  value: number;
  status: Learner['status'];
}) {
  const barColor = status === 'needs-attention' ? 'bg-warning' : 'bg-primary';
  return (
    <div className="flex items-center gap-3">
      <AppProgressBar
        percent={value}
        className="w-32"
        barClassName={barColor}
      />
      <span className={cx(CELL_EMPHASIS, 'text-text')}>{value}%</span>
    </div>
  );
}

function LearnerCell({ learner }: { learner: Learner }) {
  return (
    <div className="flex min-w-55 items-center gap-3">
      {learner.avatarUrl ? (
        <div
          aria-label={learner.name}
          className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${learner.avatarUrl})` }}
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-disabled text-text-secondary f1-m">
          {learner.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="b2-m whitespace-nowrap text-text">{learner.name}</p>
        <p className="f1-r whitespace-nowrap text-muted">{learner.email}</p>
      </div>
    </div>
  );
}

function EmptyLearnersState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-disabled">
        <Users size={20} className="text-muted" />
      </div>
      <p className="b2-m text-text">No learners assigned yet</p>
      <p className="b2-r max-w-xs text-text-secondary">
        Once learners are assigned to you, you&apos;ll be able to track their
        progress here.
      </p>
    </div>
  );
}

export interface MyLearnersPageProps {
  learners: Learner[];
  mentorName?: string;
  onExport?: () => void;
  onRowClick?: (learner: Learner) => void;
}

const MyLearnersPage: React.FC<MyLearnersPageProps> = ({
  learners = [],
  onExport,
  onRowClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const counts = useMemo(
    () => ({
      all: learners.length,
      'needs-attention': learners.filter((l) => l.status === 'needs-attention')
        .length,
      'on-track': learners.filter((l) => l.status === 'on-track').length,
    }),
    [learners],
  );

  const filteredLearners = useMemo(() => {
    if (activeTab === 'all') return learners;
    return learners.filter((l) => l.status === activeTab);
  }, [learners, activeTab]);

  const columns: AppTableColumn<Learner>[] = [
    {
      key: 'learner',
      header: 'Learner',
      render: (row) => <LearnerCell learner={row} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'module',
      header: 'Module',
      render: (row) => (
        <span className={cx(CELL_EMPHASIS, 'whitespace-nowrap text-text')}>
          {row.module}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <ProgressCell value={row.progress} status={row.status} />
      ),
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (row) => (
        <span className={cx(CELL_EMPHASIS, 'whitespace-nowrap text-text')}>
          {row.lastActive}
        </span>
      ),
    },
    {
      key: 'chevron',
      header: '',
      align: 'right',
      render: () => <ChevronRight size={16} className="text-muted" />,
    },
  ];

  const hasLearners = learners.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        title={`${learners.length} Learners assigned to you`}
        subtitle="Track progress and stay in touch with each one..."
        actions={
          <AppButton
            variant="outlined"
            color="primary"
            size="medium"
            radius="full"
            startIcon={<Download size={16} />}
            onClick={onExport}
            disabled={!hasLearners}
          >
            Export list
          </AppButton>
        }
      />

      <div className="rounded-card bg-background">
        <div className="flex items-center gap-6 border-b border-border px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cx(
                'b2-m -mb-px whitespace-nowrap border-b-2 px-1 py-3 transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-text',
              )}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="f1-r ml-1 text-muted">
                  ({counts[tab.key]})
                </span>
              )}
            </button>
          ))}
        </div>

        {hasLearners ? (
          <AppTable
            columns={columns}
            data={filteredLearners}
            getRowKey={(row) => row.id}
            minWidth={960}
            className="[&_th]:px-6 [&_td]:px-6"
            onRowClick={onRowClick}
          />
        ) : (
          <EmptyLearnersState />
        )}
      </div>
    </div>
  );
};

export default MyLearnersPage;
