'use client';

import { useMemo, useState } from 'react';

import PageHeader from '@/components/ui/AppPageHeader';
import { AppCard } from '@/components/ui/AppCard';

import ResourceCard, {
  type Resource,
  type ResourceType,
} from './ResourceCard';

const resources: Resource[] = [
  {
    id: 'javascript-functions-explained',
    title: 'JavaScript Functions Explained',
    description:
      'Master the core concepts of functions, including syntax, scope, and return values.',
    type: 'Article',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
  },
  {
    id: 'javascript-functions-beginner',
    title: 'JavaScript Functions — Beginner Guide',
    description:
      'An in-depth article covering everything from basic declarations to arrow functions.',
    type: 'Article',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
  },
  {
    id: 'javascript-fundamentals-cheat-sheet',
    title: 'JavaScript Fundamentals Cheat Sheet',
    description:
      'Quick reference guide for variables, loops, and function syntax.',
    type: 'Document',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
  },
  {
    id: 'practice-javascript-functions',
    title: 'Practice JavaScript Functions',
    description:
      'Interactive coding challenges to reinforce your understanding of function logic.',
    type: 'Interactive',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
  },
];

const filters: Array<{
  label: string;
  value: 'All Resources' | ResourceType;
}> = [
  {
    label: 'All Resources',
    value: 'All Resources',
  },
  {
    label: 'Video',
    value: 'Video',
  },
  {
    label: 'Articles',
    value: 'Article',
  },
  {
    label: 'Documents',
    value: 'Document',
  },
  {
    label: 'Interactive',
    value: 'Interactive',
  },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<'All Resources' | ResourceType>('All Resources');

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === 'All Resources' ||
        resource.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Resources"
        subtitle="Extra material to support your learning."
      />

      {/* Search and filters */}
      <AppCard padding="md">
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative">
            <label
              htmlFor="resource-search"
              className="sr-only"
            >
              Search resources
            </label>

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              ⌕
            </span>

            <input
              id="resource-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              className="h-14 w-full rounded-lg border border-disabled bg-background pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={[
                    'rounded-full px-5 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-disabled text-text-secondary hover:bg-primary-light hover:text-primary',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </AppCard>

      {/* Results */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      ) : (
        <AppCard padding="lg">
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-xl text-primary">
              🔍
            </div>

            <h2 className="mt-5 text-lg font-semibold text-text-primary">
              No resources found
            </h2>

            <p className="mt-2 max-w-md text-sm text-text-secondary">
              We couldn&apos;t find any resources matching your search or
              filter.
            </p>
          </div>
        </AppCard>
      )}
    </div>
  );
}
