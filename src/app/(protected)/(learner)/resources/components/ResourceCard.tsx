import { AppCard } from '@/components/ui/AppCard';

export type ResourceType =
  | 'Video'
  | 'Article'
  | 'Document'
  | 'Interactive';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  author: string;
  level: string;
}

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({
  resource,
}: ResourceCardProps) {
  const icon =
    resource.type === 'Video'
      ? '▶'
      : resource.type === 'Document'
        ? '▤'
        : resource.type === 'Interactive'
          ? '</>'
          : 'A';

  return (
    <AppCard
      href={`/resources/${resource.id}`}
      interactive
      padding="md"
      className="flex h-full min-h-[190px] flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <AppCard.Icon variant="primary">
          <span className="text-sm font-semibold">
            {icon}
          </span>
        </AppCard.Icon>

        <span className="rounded-full bg-disabled px-3 py-1 text-[10px] font-medium uppercase text-text-secondary">
          {resource.level}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-sm font-semibold text-text-primary">
          {resource.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-4 text-text-secondary">
          {resource.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[10px] text-text-secondary">
            {resource.category}
          </span>

          <span className="text-xs font-medium text-primary">
            View Resource →
          </span>
        </div>
      </div>
    </AppCard>
  );
}
