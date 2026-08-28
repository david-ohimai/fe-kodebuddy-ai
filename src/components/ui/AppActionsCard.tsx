import React from 'react';
import { Lightbulb } from 'lucide-react';
import { AppCard, type AppCardVariant } from './AppCard';
import AppButton from './AppButton';

export interface AppActionSection {
  icon: React.ElementType;
  iconVariant?: AppCardVariant;
  title: string;
  description: string;
  control: React.ReactNode;
}

export interface AppActionsCardProps {
  title: string;
  sections: AppActionSection[];
  hint?: React.ReactNode;
  emptyState?: React.ReactNode;
  showFooterActions?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmLoading?: boolean;
  className?: string;
}

export default function AppActionsCard({
  title,
  sections,
  hint,
  emptyState,
  showFooterActions = false,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm change',
  confirmLoading = false,
  className,
}: AppActionsCardProps) {
  return (
    <AppCard padding="md" className={className}>
      <h2 className="b1-b mb-4 text-text">{title}</h2>

      {emptyState ? (
        emptyState
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-3 flex items-start gap-3">
                <AppCard.Icon variant={section.iconVariant ?? 'primary'}>
                  <section.icon />
                </AppCard.Icon>
                <div>
                  <p className="b2-b text-text">{section.title}</p>
                  <p className="f1-r text-muted">{section.description}</p>
                </div>
              </div>
              {section.control}
            </div>
          ))}

          {hint && (
            <div className="flex items-start gap-2.5 rounded-input bg-primary-light px-4 py-3">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="f1-r text-primary-dark">{hint}</p>
            </div>
          )}

          {showFooterActions && (
            <div className="flex items-center gap-2">
              <AppButton
                variant="outlined"
                color="neutral"
                radius="full"
                onClick={onCancel}
                className="flex-1"
              >
                {cancelLabel}
              </AppButton>
              <AppButton
                radius="full"
                onClick={onConfirm}
                loading={confirmLoading}
                className="flex-1"
              >
                {confirmLabel}
              </AppButton>
            </div>
          )}
        </div>
      )}
    </AppCard>
  );
}
