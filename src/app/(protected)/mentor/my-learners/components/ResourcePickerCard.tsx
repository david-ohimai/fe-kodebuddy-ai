'use client';

import React, { useMemo, useState } from 'react';
import { Search, PlayCircle, FileText, File } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';

export type ResourceType = 'video' | 'article' | 'document';

export interface RecommendableResource {
  id: string;
  title: string;
  subtitle: string;
  type: ResourceType;
}

type TabKey = 'all' | 'video' | 'article' | 'document';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Videos' },
  { key: 'article', label: 'Articles' },
  { key: 'document', label: 'Documents' },
];

const TYPE_ICON: Record<ResourceType, React.ElementType> = {
  video: PlayCircle,
  article: FileText,
  document: File,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export interface ResourcePickerCardProps {
  resources: RecommendableResource[];
  onCancel: () => void;
  onNext: (resource: RecommendableResource) => void;
  className?: string;
}

const ResourcePickerCard: React.FC<ResourcePickerCardProps> = ({
  resources,
  onCancel,
  onNext,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesTab = activeTab === 'all' || resource.type === activeTab;
      const matchesSearch =
        !query || resource.title.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [resources, activeTab, search]);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  return (
    <AppCard padding="lg" className={className}>
      <h2 className="b1-b text-text">Choose a resource to recommend</h2>

      <div className="mt-4 border-b border-disabled pb-4">
        <AppInput
          icon={Search}
          placeholder="Search Resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 flex items-center gap-6 border-b border-disabled pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cx(
              'b2-m -mb-3 whitespace-nowrap border-b-2 pb-3 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filteredResources.map((resource) => {
          const Icon = TYPE_ICON[resource.type];
          const isSelected = resource.id === selectedId;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => setSelectedId(resource.id)}
              className={cx(
                'flex items-center gap-3 rounded-card border px-4 py-3 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary-light/30'
                  : 'border-disabled hover:border-muted/40',
              )}
            >
              <span
                className={cx(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-btn',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-disabled text-muted',
                )}
              >
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="b2-b truncate text-text">{resource.title}</p>
                <p className="f1-r truncate text-muted">{resource.subtitle}</p>
              </div>
              <span
                className={cx(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-disabled bg-background',
                )}
              />
            </button>
          );
        })}

        {filteredResources.length === 0 && (
          <p className="b2-r py-6 text-center text-muted">
            No resources match your search.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <AppButton
          variant="outlined"
          color="neutral"
          radius="full"
          onClick={onCancel}
        >
          Cancel
        </AppButton>
        <AppButton
          radius="full"
          disabled={!selectedResource}
          onClick={() => selectedResource && onNext(selectedResource)}
        >
          Next
        </AppButton>
      </div>
    </AppCard>
  );
};

export default ResourcePickerCard;
