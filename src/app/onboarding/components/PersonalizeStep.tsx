'use client';

import React, { useState } from 'react';
import AppRadioCard from '@/components/ui/AppRadioCard';
import AppChipToggle from '@/components/ui/AppChipToggle';
import AppButton from '@/components/ui/AppButton';
import { LEARNING_GOALS, LEARNING_INTERESTS } from '@/types/auth.types';
import type { LearningGoal, OnboardingFormValues } from '@/types/auth.types';

export interface PersonalizeStepProps {
  loading?: boolean;
  onContinue: (values: OnboardingFormValues) => void;
}

export default function PersonalizeStep({
  loading = false,
  onContinue,
}: PersonalizeStepProps) {
  const [learningGoal, setLearningGoal] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const canContinue = !!learningGoal && !loading;

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

      <AppButton
        fullWidth
        radius="full"
        size="large"
        loading={loading}
        disabled={!canContinue}
        onClick={() =>
          onContinue({ learningGoal: learningGoal as LearningGoal, interests })
        }
      >
        Continue
      </AppButton>
    </div>
  );
}
