'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppInput from '@/components/ui/AppInput';
import AppTextarea from '@/components/ui/AppTextarea';
import AppButton from '@/components/ui/AppButton';
import type { Cohort } from '@/lib/api/cohorts.api';

export interface EditCohortModalProps {
  open: boolean;
  cohort: Cohort;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export default function EditCohortModal({
  open,
  cohort,
  saving = false,
  onClose,
  onSave,
}: EditCohortModalProps) {
  const [name, setName] = useState(cohort.name);
  const [description, setDescription] = useState(cohort.description ?? '');
  const [startDate, setStartDate] = useState(cohort.startDate.slice(0, 10));
  const [endDate, setEndDate] = useState(cohort.endDate.slice(0, 10));

  const reset = () => {
    setName(cohort.name);
    setDescription(cohort.description ?? '');
    setStartDate(cohort.startDate.slice(0, 10));
    setEndDate(cohort.endDate.slice(0, 10));
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = name.trim().length > 0 && !!startDate && !!endDate;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth={560}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            onClick={handleClose}
          >
            Cancel
          </AppButton>
          <AppButton
            radius="full"
            loading={saving}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Save changes
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="h6-b text-text">Edit cohort</h3>
            <p className="b2-r mt-1 text-text-secondary">
              Update the details for this cohort.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-text-secondary hover:bg-disabled hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <AppInput
          label={
            <>
              Cohort name <span className="text-error">*</span>
            </>
          }
          placeholder="e.g. Data Analysis Cohort 01"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AppInput
            label={
              <>
                Start Date <span className="text-error">*</span>
              </>
            }
            type="date"
            icon={Calendar}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <AppInput
            label={
              <>
                End Date <span className="text-error">*</span>
              </>
            }
            type="date"
            icon={Calendar}
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <AppTextarea
          label="Description (optional)"
          placeholder="What is this cohort about?"
          value={description}
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
