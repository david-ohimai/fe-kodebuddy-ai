import React from 'react';
import { Video, FileText, Image as ImageIcon, Lock } from 'lucide-react';
import type { AppPillProps } from '@/components/ui/AppPill';

export type LessonContentType = 'video' | 'document' | 'article' | 'file';

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
    type: 'video',
    label: 'Video',
    description: 'Upload or attach a video as the main content',
    icon: <Video size={18} />,
    tint: 'bg-primary-light text-primary',
    pillColor: 'primary',
  },
  {
    type: 'document',
    label: 'Document / file',
    description: 'Upload or attach a document or other file.',
    icon: <FileText size={18} />,
    tint: 'bg-success-light text-success',
    pillColor: 'success',
  },
  {
    type: 'article',
    label: 'Article',
    description: 'Create an article with rich text content.',
    icon: <ImageIcon size={18} />,
    tint: 'bg-warning-light text-warning-dark',
    pillColor: 'warning',
  },
  {
    type: 'file',
    label: 'Document',
    description: 'Add a PDF or other document as the lesson content.',
    icon: <Lock size={18} />,
    tint: 'bg-[#F3E8FF] text-[#7C3AED]',
    pillColor: 'default',
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
