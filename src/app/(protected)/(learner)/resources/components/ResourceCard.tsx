import Link from 'next/link';

import { AppCard } from '@/components/ui/AppCard';

import type { Resource } from '../resources.data';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({
  resource,
}: ResourceCardProps) {
  return (
    <AppCard
      href={`/resources/${resource.id}`}
      interactive
      padding="md"
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <AppCard.Icon variant="primary">
          <span className="text-sm font-semibold">
            {resource.type === 'Video'
              ? '▶'
              : resource.type === 'Document'
                ? '▤'
                : resource.type === 'Interactive'
                  ? '⌘'
                  : 'A'}
          </span>
        </AppCard.Icon>

        <span className="rounded-full bg-disabled px-3 py-1 text-xs font-medium text-text-secondary">
          {resource.type}
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-base font-semibold text-text-primary">
          {resource.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-5 text-text-secondary">
          {resource.description}
        </p>

        <div className="mt-auto pt-5">
          <span className="text-sm font-medium text-primary">
            View Resource →
          </span>
        </div>
      </div>
    </AppCard>
  );
}