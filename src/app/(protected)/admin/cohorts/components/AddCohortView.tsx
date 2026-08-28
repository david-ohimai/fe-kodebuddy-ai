'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/lib/api/client';
import * as cohortsApi from '@/lib/api/cohorts.api';
import type { Cohort } from '@/lib/api/cohorts.api';
import CreateCohortModal from './AddCohortModal';

export interface CohortFormData {
  name: string;
  startDate: string;
  endDate: string;
}

interface AddCohortViewProps {
  onBack: () => void;
  onCreated?: (cohort: Cohort) => void;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

const AddCohortView: React.FC<AddCohortViewProps> = ({ onBack, onCreated }) => {
  const { showError } = useToast();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCohort, setCreatedCohort] = useState<Cohort | null>(null);

  const isValid = name.trim().length > 0 && !!startDate && !!endDate;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    if (endDate && value && endDate < value) {
      setEndDate('');
    }
  };

  const handleCreate = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const cohort = await cohortsApi.createCohort({
        name: name.trim(),
        startDate,
        endDate,
      });
      setCreatedCohort(cohort);
      onCreated?.(cohort);
      setShowSuccess(true);
    } catch (err) {
      showError(
        'Could not create cohort',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setCreatedCohort(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 b2-b text-primary"
      >
        <ArrowLeft size={16} />
        Back to cohort
      </button>

      <AppCard padding="none">
        <div className="border-b border-disabled px-6 py-5">
          <h2 className="h5-b text-text">Create cohort</h2>
          <p className="b2-r mt-1 text-muted">
            Enter the details below to create a new cohort.
          </p>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          <AppInput
            label={
              <>
                Cohort name <span className="text-error">*</span>
              </>
            }
            placeholder="e.g. Data Analysis Cohort 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
            containerClassName="max-w-md"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AppInput
              label={
                <>
                  Start Date <span className="text-error">*</span>
                </>
              }
              type="date"
              icon={Calendar}
              min={today()}
              value={startDate}
              onChange={handleStartDateChange}
            />

            <AppInput
              label={
                <>
                  End Date <span className="text-error">*</span>
                </>
              }
              type="date"
              icon={Calendar}
              min={startDate || today()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <AppButton
              variant="outlined"
              color="neutral"
              radius="full"
              onClick={onBack}
              disabled={submitting}
            >
              Cancel
            </AppButton>
            <AppButton
              radius="full"
              onClick={handleCreate}
              disabled={!isValid || submitting}
              loading={submitting}
            >
              Create cohort
            </AppButton>
          </div>
        </div>
      </AppCard>

      <CreateCohortModal
        open={showSuccess}
        cohort={{
          name: createdCohort?.name ?? name,
          startDate: createdCohort?.startDate ?? startDate,
          endDate: createdCohort?.endDate ?? endDate,
        }}
        onClose={() => setShowSuccess(false)}
        onBackToCohort={() => {
          setShowSuccess(false);
          onBack();
        }}
        onCreateAnother={() => {
          setShowSuccess(false);
          resetForm();
        }}
      />
    </div>
  );
};

export default AddCohortView;
