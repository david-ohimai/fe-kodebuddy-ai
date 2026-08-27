'use client';

import React, { useState } from 'react';

import { AssignmentCard } from './AssignmentCard';
import AppEmptyState from '@/components/ui/AppEmptyState';

import emptyStateImage from '@/assets/images/empty state assign.webp';

export interface AssignmentItem {
  id: string;
  title: string;
  moduleName: string;
  dueDate: string;
  status:
    | 'pending'
    | 'in-progress'
    | 'submitted'
    | 'graded'
    | 'overdue';
  score?: string;
}

interface AssignmentsListProps {
  assignments: AssignmentItem[];
  loading?: boolean;
}

type AssignmentTab =
  | 'all'
  | 'pending'
  | 'in-progress'
  | 'submitted'
  | 'escalations';

export const AssignmentsList: React.FC<
  AssignmentsListProps
> = ({
  assignments,
  loading = false,
}) => {
  const [activeTab, setActiveTab] =
    useState<AssignmentTab>('all');

  const filteredAssignments =
    activeTab === 'all'
      ? assignments
      : assignments.filter(
          (assignment) =>
            assignment.status === activeTab,
        );

  const tabs: {
    label: string;
    value: AssignmentTab;
  }[] = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'In-progress',
      value: 'in-progress',
    },
    {
      label: 'Submitted',
      value: 'submitted',
    },
    {
      label: 'Escalations',
      value: 'escalations',
    },
  ];

  return (
    <section className="space-y-4">
     
     {/* Tabs */}
<div
  className="
    flex
    items-center
    gap-6
    rounded-xl
    bg-white
    px-5
  "
>
  {tabs.map((tab) => {
    const active = activeTab === tab.value;

    return (
      <button
        key={tab.value}
        type="button"
        onClick={() => setActiveTab(tab.value)}
        className={`
          relative
          py-3
          text-xs
          font-medium
          transition-colors
          ${
            active
              ? 'text-primary'
              : 'text-muted hover:text-text'
          }
        `}
      >
        {tab.label}

        {/* Active underline */}
        {active && (
          <span
            className="
              absolute
              bottom-0
              left-0
              right-0
              h-[2px]
              rounded-full
              bg-primary
            "
          />
        )}
      </button>
    );
  })}
</div>

      {/* Loading state */}
      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  min-h-[190px]
                  animate-pulse
                  rounded-xl
                  border
                  border-disabled
                  bg-white
                  p-4
                "
              >
                <div className="h-3 w-28 rounded bg-disabled" />

                <div className="mt-4 h-7 w-20 rounded-full bg-disabled" />

                <div className="mt-5 h-4 w-full rounded bg-disabled" />

                <div className="mt-2 h-4 w-3/4 rounded bg-disabled" />

                <div className="mt-5 h-3 w-16 rounded bg-disabled" />

                <div className="mt-2 h-3 w-24 rounded bg-disabled" />

                <div className="mt-5 h-9 w-full rounded-lg bg-disabled" />
              </div>
            ),
          )}
        </div>
      )}

      {/* Assignment cards */}
      {!loading &&
        filteredAssignments.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {filteredAssignments.map(
              (assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                />
              ),
            )}
          </div>
        )}

      {/* Empty state */}
      {!loading &&
        filteredAssignments.length === 0 && (
          <div
            className="
              min-h-[460px]
              rounded-xl
              bg-white
            "
          >
            <AppEmptyState
              image={emptyStateImage}
              title="No assignment"
              description={
                activeTab === 'all'
                  ? 'There are no assignments in this categories yet'
                  : `There are no ${activeTab} assignments in this category yet`
              }
            />
          </div>
        )}
    </section>
  );
};
