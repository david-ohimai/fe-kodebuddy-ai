'use client';

import React from 'react';
import Image from 'next/image';
import { GraduationCap, Calendar } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import cohortCreatedIcon from '@/assets/images/account-ready.webp';

interface CohortSummary {
  name: string;
  startDate: string;
  endDate: string;
}

interface CohortCreatedModalProps {
  open: boolean;
  cohort: CohortSummary;
  onClose: () => void;
  onBackToCohort: () => void;
  onCreateAnother: () => void;
}

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between border-b border-disabled py-3 last:border-b-0">
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon}
      </span>
      <span className="b2-r text-text-secondary">{label}</span>
    </div>
    <span className="b2-b text-text">{value}</span>
  </div>
);

export default function AddCohortModal({
  open,
  cohort,
  onClose,
  onBackToCohort,
  onCreateAnother,
}: CohortCreatedModalProps) {
  return (
    <AppModal open={open} onClose={onClose} showCloseButton={false} maxWidth={823}>
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <Image
          src={cohortCreatedIcon}
          alt=""
          width={100}
          height={100}
          className="mb-5"
        />

        <h2 className="h5-b text-text">Cohort Created Successfully.</h2>
        <p className="b2-r mt-1 text-muted">
          Your cohort has been created successfully.
        </p>

        <div className="mt-5 w-full max-w-[500px]">
          <DetailRow
            icon={<GraduationCap size={15} />}
            label="Cohort Name"
            value={cohort.name || '—'}
          />
          <DetailRow
            icon={<Calendar size={15} />}
            label="Start Date"
            value={formatDate(cohort.startDate)}
          />
          <DetailRow
            icon={<Calendar size={15} />}
            label="End Date"
            value={formatDate(cohort.endDate)}
          />
        </div>

        <div className="mt-6 flex w-full max-w-[500px] items-center gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            className="flex-1"
            onClick={onBackToCohort}
          >
            Back to cohort
          </AppButton>
          <AppButton radius="full" className="flex-1" onClick={onCreateAnother}>
            Create another cohort
          </AppButton>
        </div>

        <p className="f1-r mt-4 text-muted">
          You can invite more trainers and more mentor anytime
        </p>
      </div>
    </AppModal>
  );
}
