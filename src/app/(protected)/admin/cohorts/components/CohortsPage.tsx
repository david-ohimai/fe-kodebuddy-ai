'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import AppButton from '@/components/ui/AppButton';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppTable, { type AppTableColumn } from '@/components/ui/AppTable';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AppPill from '@/components/ui/AppPill';
import AppPagination from '@/components/ui/AppPagination';
import { AppCard } from '@/components/ui/AppCard';
import AddCohortView from './AddCohortView';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import type { Cohort } from '@/lib/api/cohorts.api';
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
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    let cancelled = false;
    cohortsApi
      .listCohorts()
      .then(async (list) => {
        if (cancelled) return;
        const learnerCounts = await Promise.all(
          list.map((cohort) =>
            cohortsApi
              .listCohortLearners(cohort.id)
              .then((learners) => learners.filter((l) => l.isActive).length)
              .catch(() => 0),
          ),
        );
        if (!cancelled) {
          setCohorts(
            list.map((cohort, i) => ({
              id: String(cohort.id),
              name: cohort.name,
              startDate: cohort.startDate,
              endDate: cohort.endDate,
              learners: learnerCounts[i],
              status: cohort.isOpen ? 'active' : 'inactive',
            })),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load cohorts',
            getErrorMessage(err, 'Please try again.'),
          );
        }
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const filteredCohorts = cohorts.filter((cohort) =>
    cohort.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hasCohorts = filteredCohorts.length > 0;

  const totalPages = Math.max(1, Math.ceil(filteredCohorts.length / PAGE_SIZE));
  const paginatedCohorts = filteredCohorts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleCohortCreated = (cohort: Cohort) => {
    setCohorts((prev) => [
      {
        id: String(cohort.id),
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        learners: 0,
        status: cohort.isOpen ? 'active' : 'inactive',
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
      render: (row) => (
        <Link
          href={`/admin/cohorts/${row.id}`}
          aria-label="View cohort"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-disabled hover:text-text"
        >
          <ChevronRight size={18} />
        </Link>
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
        actions={
          <AppButton
            radius="full"
            startIcon={<Plus size={16} />}
            onClick={() => setView('add')}
          >
            Create cohort
          </AppButton>
        }
      />

      <AppCard padding="none">
        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : (
          <>
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
                title={
                  cohorts.length === 0 ? 'No cohorts yet' : 'No matching cohorts'
                }
                description={
                  cohorts.length === 0
                    ? 'Create your first cohort to start organising learners and their courses.'
                    : 'Try adjusting your search.'
                }
                actionLabel={cohorts.length === 0 ? 'Create cohort' : undefined}
                onAction={cohorts.length === 0 ? () => setView('add') : undefined}
              />
            )}
          </>
        )}
      </AppCard>
    </div>
  );
};

export default CohortsView;
