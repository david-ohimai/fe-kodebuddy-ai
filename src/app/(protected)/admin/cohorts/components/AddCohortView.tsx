'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import CreateCohortModal from './AddCohortModal';

export interface CohortFormData {
  name: string;
  startDate: string;
  endDate: string;
}

interface AddCohortViewProps {
  onBack: () => void;
  onCreated?: (cohort: CohortFormData) => void;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

const AddCohortView: React.FC<AddCohortViewProps> = ({ onBack, onCreated }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isValid = name.trim().length > 0 && !!startDate && !!endDate;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    // clear end date if it's now before the new start date
    if (endDate && value && endDate < value) {
      setEndDate('');
    }
  };

  const handleCreate = () => {
    if (!isValid) return;
    // TODO: replace with the real create-cohort API call.
    onCreated?.({ name, startDate, endDate });
    setShowSuccess(true);
  };

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
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
            >
              Cancel
            </AppButton>
            <AppButton radius="full" onClick={handleCreate} disabled={!isValid}>
              Create cohort
            </AppButton>
          </div>
        </div>
      </AppCard>

      <CreateCohortModal
        open={showSuccess}
        cohort={{ name, startDate, endDate }}
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
