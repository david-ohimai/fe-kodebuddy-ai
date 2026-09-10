import { PlayCircle, FileText, File, Code2, ExternalLink } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import type { LearnerResource, ResourceType } from '@/types/resource.types';

interface ResourceCardProps {
  resource: LearnerResource;
}

const PLACEHOLDER_LEVEL = 'Beginner';

const TYPE_META: Record<
  ResourceType,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: 'primary' | 'warning' | 'error' | 'success';
  }
> = {
  Document: { icon: File, variant: 'error' },
  Link: { icon: ExternalLink, variant: 'primary' },
  Article: { icon: FileText, variant: 'warning' },
  Video: { icon: PlayCircle, variant: 'primary' },
  Interactive: { icon: Code2, variant: 'success' },
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const meta = TYPE_META[resource.type] ?? TYPE_META.Document;
  const { icon: Icon, variant } = meta;

  return (
    <AppCard
      href={`/resources/${resource.id}`}
      interactive
      padding="md"
      className="flex h-full min-h-[200px] flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <AppCard.Icon variant={variant}>
          <Icon />
        </AppCard.Icon>

        <span className="f1-m rounded-full bg-disabled px-3 py-1 uppercase text-text-secondary">
          {PLACEHOLDER_LEVEL}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="b1-b text-text">{resource.title}</h3>

        <p className="b2-r mt-2 line-clamp-2 text-text-secondary">
          {resource.description || 'No description added yet.'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-disabled pt-4">
          <span className="f1-r text-text-secondary">
            {resource.courseTitle}
          </span>
          <span className="b2-m flex shrink-0 items-center gap-1 text-primary">
            View Resource →
          </span>
        </div>
      </div>
    </AppCard>
  );
}
