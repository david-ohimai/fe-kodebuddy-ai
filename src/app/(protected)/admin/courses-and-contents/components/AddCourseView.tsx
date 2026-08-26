'use client';

import React, { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';

interface AddCourseViewProps {
  onBack: () => void;
  onSaveDraft: (title: string) => void;
}

const AddCourseView: React.FC<AddCourseViewProps> = ({
  onBack,
  onSaveDraft,
}) => {
  const [title, setTitle] = useState('');
  const isTitleEmpty = title.trim().length === 0;

  const handleSaveDraft = () => {
    if (isTitleEmpty) return;
    onSaveDraft(title.trim());
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to content &amp; courses
      </button>

      <div className="flex flex-col gap-6 rounded-card border border-disabled bg-background p-6">
        <div>
          <h2 className="h5-b text-text">Add course</h2>
          <p className="b2-r mt-1 text-text-secondary">
            Create a new course by entering the basic information.
          </p>
        </div>

        <AppInput
          label="Course title *"
          placeholder="Enter course title"
          hint="This will be saved as a draft. You can edit and publish it later."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-3 rounded-input bg-primary-light p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="b2-b text-text">What happens next?</p>
            <p className="b2-r text-text-secondary">
              After saving the draft, you&apos;ll be taken to the course details
              page where you can add modules, lessons and content.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            onClick={onBack}
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={handleSaveDraft}
            radius="full"
            disabled={isTitleEmpty}
          >
            Save draft
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default AddCourseView;
