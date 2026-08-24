'use client';

import React from 'react';

export interface AppTabItem {
  id: string;
  label: string;
}

export interface AppTabProps {
  tabs: AppTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

const AppTab: React.FC<AppTabProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      role="tablist"
      className={cx(
        'flex gap-1 border-b border-disabled',
        'md:rounded-btn md:border-b-0 md:bg-primary-light md:p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cx(
              'b2-m -mb-px border-b-2 px-3 py-2.5 transition-colors',
              'md:mb-0 md:rounded-btn md:border-b-0 md:px-3.5 md:py-2',
              isActive
                ? 'border-primary text-primary md:bg-primary md:text-background'
                : 'border-transparent text-muted hover:text-text-secondary md:hover:bg-background',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default AppTab;
