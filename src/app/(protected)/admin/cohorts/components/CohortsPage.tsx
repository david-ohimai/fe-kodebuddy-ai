'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppTable, { type AppTableColumn } from '@/components/ui/AppTable';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import AppPagination from '@/components/ui/AppPagination';
import { AppCard } from '@/components/ui/AppCard';
import AddCohortView, { type CohortFormData } from './AddCohortView';
import noCohorts from '@/assets/images/no-cohorts.webp';

interface CohortRow {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  learners: number;
  status: 'active' | 'inactive';
}

const PAGE_SIZE = 4;

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const CohortsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'add'>('list');
  const [page, setPage] = useState(1);
  // TODO: replace with real API data once endpoints are ready.
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);

  const hasCohorts = cohorts.length > 0;

  const filteredCohorts = cohorts.filter((cohort) =>
    cohort.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredCohorts.length / PAGE_SIZE));
  const paginatedCohorts = filteredCohorts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleCohortCreated = (cohort: CohortFormData) => {
    setCohorts((prev) => [
      {
        id: crypto.randomUUID(),
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        learners: 0,
        status: 'active',
      },
      ...prev,
    ]);
    setPage(1);
  };

  const columns: AppTableColumn<CohortRow>[] = [
    {
      key: 'name',
      header: 'Cohort name',
      render: (row) => <span className="b2-b text-text">{row.name}</span>,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => (
        <span className="b2-r text-text-secondary">
          {formatDate(row.startDate)}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (row) => (
        <span className="b2-r text-text-secondary">
          {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      key: 'learners',
      header: 'Learners',
      render: (row) => (
        <span className="b2-r text-text-secondary">{row.learners}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <AppPill
          label={row.status === 'active' ? 'Active' : 'Inactive'}
          color={row.status === 'active' ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: () => (
        <button
          type="button"
          aria-label="View cohort"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-disabled hover:text-text"
        >
          <ChevronRight size={18} />
        </button>
      ),
    },
  ];

  if (view === 'add') {
    return (
      <AddCohortView
        onBack={() => setView('list')}
        onCreated={handleCohortCreated}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cohorts"
        subtitle="View, search and manage all cohorts."
      />

      <AppCard padding="none">
        {hasCohorts && (
          <div className="p-4">
            <TableHeader
              searchValue={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search cohorts..."
            />
          </div>
        )}

        {hasCohorts ? (
          <>
            <AppTable
              columns={columns}
              data={paginatedCohorts}
              getRowKey={(row) => row.id}
            />

            <div className="px-4 pb-4">
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </>
        ) : (
          <AppEmptyState
            image={noCohorts}
            title="No cohorts yet"
            description="Create your first cohort to start organising learners and their courses."
            actionLabel="Create cohort"
            onAction={() => setView('add')}
          />
        )}
      </AppCard>
    </div>
  );
};

export default CohortsView;
