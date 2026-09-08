import React from 'react';
import { FileText, Link2, Newspaper } from 'lucide-react';
import type { AppPillProps } from '@/components/ui/AppPill';

export type LessonContentType = 'document' | 'link' | 'article';

export interface ContentTypeMeta {
  type: LessonContentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  tint: string;
  pillColor: AppPillProps['color'];
}

export const CONTENT_TYPES: ContentTypeMeta[] = [
  {
    type: 'document',
    label: 'Document',
    description: 'Upload a document or other file.',
    icon: <FileText size={18} />,
    tint: 'bg-success-light text-success',
    pillColor: 'success',
  },
  {
    type: 'link',
    label: 'Link',
    description: 'Add a web link as the lesson resource.',
    icon: <Link2 size={18} />,
    tint: 'bg-primary-light text-primary',
    pillColor: 'primary',
  },
  {
    type: 'article',
    label: 'Article',
    description: 'Write an article as the lesson resource.',
    icon: <Newspaper size={18} />,
    tint: 'bg-warning-light text-warning-dark',
    pillColor: 'warning',
  },
];

export const CONTENT_TYPE_META: Record<LessonContentType, ContentTypeMeta> =
  CONTENT_TYPES.reduce(
    (acc, meta) => {
      acc[meta.type] = meta;
      return acc;
    },
    {} as Record<LessonContentType, ContentTypeMeta>,
  );
