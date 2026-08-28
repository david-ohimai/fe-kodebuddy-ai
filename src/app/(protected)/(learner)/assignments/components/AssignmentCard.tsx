'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { AppCard } from '@/components/ui/AppCard';
import AppPill, {
  type AppPillProps,
} from '@/components/ui/AppPill';

import type { AssignmentItem } from './AssignmentsList';

interface AssignmentCardProps {
  assignment: AssignmentItem;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
}) => {
  const {
    id,
    title,
    moduleName,
    dueDate,
    status,
    score,
  } = assignment;

  const getStatusColor = (
    value: AssignmentItem['status'],
  ): AppPillProps['color'] => {
    switch (value) {
      case 'submitted':
        return 'success';

      case 'in-progress':
        return 'primary';

      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (
    value: AssignmentItem['status'],
  ): string => {
    switch (value) {
      case 'in-progress':
        return 'In progress';

      case 'submitted':
        return 'Submitted';

      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <AppCard
      className="
        group
        flex
        min-h-[190px]
        flex-col
        justify-between
        rounded-xl
        border
        border-disabled
        p-4
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-primary/40
        hover:shadow-sm
      "
    >
      <div>
        <p
          className="
            mb-3
            truncate
            text-xs
            font-medium
            text-muted
          "
          title={moduleName}
        >
          {moduleName}
        </p>

        <div className="mb-4">
          <AppPill
            label={getStatusLabel(status)}
            color={getStatusColor(status)}
            size="small"
          />
        </div>

        <h3
          className="
            line-clamp-2
            text-sm
            font-semibold
            leading-5
            text-text
          "
          title={title}
        >
          {title}
        </h3>

        <div className="mt-4">
          <p className="text-xs text-muted">
            Due date
          </p>

          <p className="mt-1 text-xs font-medium text-text-secondary">
            {dueDate}
          </p>
        </div>

        {score && (
          <p className="mt-2 text-xs font-medium text-success-dark">
            {score}
          </p>
        )}
      </div>

      <Link
        href={`/assignments/${id}`}
        className="
          mt-5
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-disabled
          px-3
          py-2
          text-xs
          font-medium
          text-text-secondary
          transition-colors
          hover:border-primary
          hover:bg-primary-light
          hover:text-primary
        "
      >
        <span>View assignment</span>

        <ArrowRight
          size={14}
          className="
            transition-transform
            group-hover:translate-x-0.5
          "
        />
      </Link>
    </AppCard>
  );
};
