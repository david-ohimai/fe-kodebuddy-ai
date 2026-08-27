import React from 'react';
import { AppCard } from './AppCard';

export interface AppInfoField {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

export interface AppInfoCardProps {
  title: string;
  header?: React.ReactNode;
  fields: AppInfoField[];
  className?: string;
}

export default function AppInfoCard({
  title,
  header,
  fields,
  className,
}: AppInfoCardProps) {
  return (
    <AppCard padding="md" className={className}>
      <h2 className="b1-b mb-4 text-text">{title}</h2>

      {header && <div className="mb-4">{header}</div>}

      <div className="divide-y divide-disabled border-t border-disabled">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <span className="b2-r flex items-center gap-2 text-text-secondary">
              <field.icon size={16} className="shrink-0 text-muted" />
              {field.label}
            </span>
            <span className="b2-m text-right text-text">{field.value}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
