'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import AppTab from '@/components/ui/AppTab';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import { getResourceDisplayMeta } from '@/lib/trainer/resourceTypeMeta';
import type { CourseResource } from '@/lib/api/resources.api';
import type { CourseModule } from '@/lib/api/modules.api';

type PickerTab = 'all' | 'videos' | 'articles' | 'documents';

const TABS: { id: PickerTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'videos', label: 'Videos' },
  { id: 'articles', label: 'Articles' },
  { id: 'documents', label: 'Documents' },
];

function bucketFor(type: string): PickerTab {
  const key = type.trim().toLowerCase();
  if (key === 'video') return 'videos';
  if (key === 'article') return 'articles';
  return 'documents';
}

export interface RecommendResourcePickerProps {
  resources: CourseResource[];
  modules: CourseModule[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (resource: CourseResource) => void;
  onCancel: () => void;
  onNext: () => void;
}

export default function RecommendResourcePicker({
  resources,
  modules,
  loading,
  selectedId,
  onSelect,
  onCancel,
  onNext,
}: RecommendResourcePickerProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<PickerTab>('all');

  const moduleOrderById = useMemo(
    () => new Map(modules.map((m) => [m.id, m.order])),
    [modules],
  );

  const filtered = resources.filter((r) => {
    const matchesTab = tab === 'all' || bucketFor(r.type) === tab;
    const matchesSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.trim().toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <div>
        <h2 className="h6-b text-text">Choose a resource to recommend</h2>
      </div>
      <hr className="border-disabled" />

      <AppInput
        icon={Search}
        placeholder="Search Resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <AppTab
        tabs={TABS}
        activeTab={tab}
        onChange={(id) => setTab(id as PickerTab)}
        variant="underline"
      />

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <AppSpinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <AppEmptyState
          size="compact"
          title="No resources found"
          description="Try a different search or add resources from My Course."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((resource) => {
            const meta = getResourceDisplayMeta({
              type: resource.type,
              mimeType: resource.mimeType,
              url: resource.url,
              fileName: resource.fileName,
            });
            const Icon = meta.icon;
            const isSelected = resource.id === selectedId;
            const order = moduleOrderById.get(resource.moduleId);
            return (
              <li key={resource.id}>
                <button
                  type="button"
                  onClick={() => onSelect(resource)}
                  className={`flex w-full items-center gap-4 rounded-card border px-4 py-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary-light/40'
                      : 'border-disabled hover:border-muted/50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      isSelected
                        ? 'bg-primary text-white'
                        : `${meta.bgClass} ${meta.textClass}`
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="b2-b text-text">{resource.title}</p>
                    <p className="f1-r text-muted">
                      {meta.label}
                      {order ? ` · Module ${order}` : ''}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted/50'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <AppButton
          variant="outlined"
          color="neutral"
          radius="full"
          onClick={onCancel}
        >
          Cancel
        </AppButton>
        <AppButton radius="full" disabled={!selectedId} onClick={onNext}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
