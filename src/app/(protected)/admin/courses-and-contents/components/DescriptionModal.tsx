import React from 'react';
import { X } from 'lucide-react';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import AppTextarea from '@/components/ui/AppTextarea';

export interface DescriptionModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function DescriptionModal({
  open,
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: DescriptionModalProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth={560}
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="outlined"
            color="neutral"
            radius="full"
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton radius="full" loading={saving} onClick={onSave}>
            Save description
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <h3 className="h6-b text-text">Course description</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-disabled hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <AppTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe what learners will get from this course..."
          rows={5}
        />
      </div>
    </AppModal>
  );
}
