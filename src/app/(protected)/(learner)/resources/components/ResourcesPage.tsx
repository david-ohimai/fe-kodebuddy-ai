'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Search } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';
import AppSpinner from '@/components/ui/AppSpinner';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppTab from '@/components/ui/AppTab';
import { listLearnerResources } from '@/lib/api/resources.api';
import { getErrorMessage } from '@/lib/api/client';
import type { LearnerResource, ResourceType } from '@/types/resource.types';
import emptyStateImage from '@/assets/images/empty state res.webp';
import ResourceCard from './ResourceCard';
import AskKodeBuddyFab from '@/components/chat/AskKodeBuddyFab';

const RESOURCES_SUGGESTIONS = [
  'Recommend a resource for a topic I\u2019m stuck on',
  'What resources go with my current course?',
];

const filters: Array<{ label: string; value: 'All Resources' | ResourceType }> =
  [
    { label: 'All Resources', value: 'All Resources' },
    { label: 'Documents', value: 'Document' },
    { label: 'Links', value: 'Link' },
    { label: 'Articles', value: 'Article' },
  ];

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<LearnerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'All Resources' | ResourceType
  >('All Resources');

  useEffect(() => {
    let cancelled = false;

    function loadResources() {
      setLoading(true);
      setError(null);
      listLearnerResources()
        .then((list) => {
          if (!cancelled) setResources(list);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(getErrorMessage(err, 'Please try again.'));
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        (resource.description ?? '').toLowerCase().includes(query) ||
        resource.moduleTitle.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === 'All Resources' || resource.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [resources, search, activeFilter]);

  const hasAnyResources = resources.length > 0;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Resources"
        subtitle="Find learning materials to support your learning journey."
      />

      <div className="flex flex-col gap-5">
        {/* Search */}
        <div className="relative">
          <label htmlFor="resource-search" className="sr-only">
            Search resources
          </label>
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="resource-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
            className="b1-r h-14 w-full rounded-input border border-disabled bg-background pl-11 pr-4 text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
          />
        </div>

        <AppTab
          tabs={filters.map((f) => ({ id: f.value, label: f.label }))}
          activeTab={activeFilter}
          onChange={(id) =>
            setActiveFilter(id as 'All Resources' | ResourceType)
          }
          variant="underline"
          ariaLabel="Filter resources"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <AppSpinner size={40} />
        </div>
      ) : error ? (
        <AppCard padding="lg">
          <AppEmptyState
            image={emptyStateImage}
            title="Could not load resources"
            description={error}
            actionLabel="Retry"
            actionIcon={<RotateCcw size={16} />}
            onAction={retry}
          />
        </AppCard>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <AppCard padding="lg">
          <AppEmptyState
            image={emptyStateImage}
            title={
              hasAnyResources
                ? 'No matching resources'
                : 'No resources available yet'
            }
            description={
              hasAnyResources
                ? "We couldn't find any resources matching your search or filter."
                : 'There are no learning resources available right now. Resources will appear here when they are added.'
            }
            actionLabel={hasAnyResources ? undefined : 'Back to Dashboard'}
            actionIcon={hasAnyResources ? undefined : null}
            onAction={
              hasAnyResources ? undefined : () => router.push('/dashboard')
            }
          />
        </AppCard>
      )}

      <AskKodeBuddyFab suggestions={RESOURCES_SUGGESTIONS} />
    </div>
  );
}
