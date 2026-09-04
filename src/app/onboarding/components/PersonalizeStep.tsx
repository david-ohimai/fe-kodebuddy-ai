'use client';

import React, { useState } from 'react';
import AppRadioCard from '@/components/ui/AppRadioCard';
import AppChipToggle from '@/components/ui/AppChipToggle';
import AppButton from '@/components/ui/AppButton';
import AppSearchSelect from '@/components/ui/AppSearchSelect';
import { useAvailableCohorts } from '@/lib/onboarding/useAvailableCohorts';
import { useAvailableCourses } from '@/lib/onboarding/useAvailableCourses';
import { LEARNING_GOALS, LEARNING_INTERESTS } from '@/types/auth.types';
import type { LearningGoal, OnboardingFormValues } from '@/types/auth.types';

export interface PersonalizeStepProps {
  loading?: boolean;
  error?: string | null;
  onContinue: (values: OnboardingFormValues) => void;
}

export default function PersonalizeStep({
  loading = false,
  error = null,
  onContinue,
}: PersonalizeStepProps) {
  const [learningGoal, setLearningGoal] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const {
    cohort,
    loading: cohortLoading,
    error: cohortError,
  } = useAvailableCohorts();
  const {
    courses: allCourses,
    loading: coursesLoading,
    error: coursesError,
  } = useAvailableCourses();

  const cohortId = cohort ? selectedCohortId : null;
  const coursesForCohort = cohortId
    ? allCourses.filter((c) => c.cohortId === cohortId)
    : [];

  const handleCohortChange = (value: string) => {
    setSelectedCohortId(Number(value));
    setCourseId(null);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const cohortRequired = !cohortLoading && !!cohort;
  const courseRequired = !!cohortId && coursesForCohort.length > 0;
  const canContinue =
    !!learningGoal &&
    (!cohortRequired || !!cohortId) &&
    (!courseRequired || !!courseId) &&
    !loading;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="h5-b text-text">Let&apos;s personalise your learning</h1>
        <p className="b2-r mt-2 text-text-secondary">
          Tell us a little about what you want to learn so KodeBuddy can make
          better recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="b2-b text-text">Your learning goal</span>
        <div className="flex flex-col gap-2.5">
          {LEARNING_GOALS.map((goal) => (
            <AppRadioCard
              key={goal.value}
              name="learningGoal"
              value={goal.value}
              label={goal.label}
              checked={learningGoal === goal.value}
              onChange={setLearningGoal}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="b2-b text-text">
          Choose your cohort
          {cohortRequired && <span className="text-error"> *</span>}
        </span>

        {cohortError ? (
          <p className="b2-r text-error">{cohortError}</p>
        ) : (
          <AppSearchSelect
            hideSearch
            value={selectedCohortId ? String(selectedCohortId) : ''}
            loading={cohortLoading}
            options={
              cohort
                ? [
                    {
                      value: String(cohort.id),
                      label: cohort.name,
                      description: cohort.isOpen ? 'Open' : 'Closed',
                    },
                  ]
                : []
            }
            onChange={handleCohortChange}
            placeholder="Select a cohort"
            emptyMessage={
              cohortLoading
                ? 'Loading cohort...'
                : 'No cohort is currently open for enrollment — you can join one later from your dashboard.'
            }
            ariaLabel="Select a cohort"
            className="w-full"
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="b2-b text-text">
          Choose your course
          {courseRequired && <span className="text-error"> *</span>}
        </span>

        {coursesError ? (
          <p className="b2-r text-error">{coursesError}</p>
        ) : (
          <AppSearchSelect
            hideSearch
            value={courseId ? String(courseId) : ''}
            loading={coursesLoading}
            disabled={!cohortId}
            options={coursesForCohort.map((c) => ({
              value: String(c.id),
              label: c.title,
              description: c.level ?? undefined,
            }))}
            onChange={(value) => setCourseId(Number(value))}
            placeholder={
              !cohortId ? 'Select a cohort first' : 'Select a course'
            }
            emptyMessage={
              coursesLoading
                ? 'Loading courses...'
                : "This cohort doesn't have a course yet — you can pick one later from your dashboard."
            }
            ariaLabel="Select a course"
            className="w-full"
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="b2-b text-text">
          Areas you&apos;re interested in. Select as many as you like.
        </span>
        <div className="flex flex-wrap gap-2">
          {LEARNING_INTERESTS.map((interest) => (
            <AppChipToggle
              key={interest}
              label={interest}
              selected={interests.includes(interest)}
              onToggle={() => toggleInterest(interest)}
            />
          ))}
        </div>
      </div>

      {error && <p className="b2-r text-error">{error}</p>}

      <AppButton
        fullWidth
        radius="full"
        size="large"
        loading={loading}
        disabled={!canContinue}
        onClick={() =>
          onContinue({
            learningGoal: learningGoal as LearningGoal,
            interests,
            cohortId,
            courseId,
          })
        }
      >
        Continue
      </AppButton>
    </div>
  );
}
