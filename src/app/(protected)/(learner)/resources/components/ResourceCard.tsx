import { PlayCircle, FileText, File, Code2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import type { LearnerResource } from '@/types/resource.types';

interface ResourceCardProps {
  resource: LearnerResource;
}

const PLACEHOLDER_LEVEL = 'Beginner';

const TYPE_META = {
  Video: { icon: PlayCircle, variant: 'primary' as const },
  Article: { icon: FileText, variant: 'warning' as const },
  Document: { icon: File, variant: 'error' as const },
  Interactive: { icon: Code2, variant: 'success' as const },
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { icon: Icon, variant } = TYPE_META[resource.type];

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
