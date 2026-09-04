import { FileText, File, Video, Link2, Folder } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ResourceTypeMeta {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

const KNOWN_TYPES: Record<string, ResourceTypeMeta> = {
  article: {
    label: 'Article',
    icon: FileText,
    bgClass: 'bg-primary-light',
    textClass: 'text-primary',
  },
  pdf: {
    label: 'PDF',
    icon: File,
    bgClass: 'bg-error-light',
    textClass: 'text-error',
  },
  video: {
    label: 'Video',
    icon: Video,
    bgClass: 'bg-warning/15',
    textClass: 'text-warning',
  },
  link: {
    label: 'Link',
    icon: Link2,
    bgClass: 'bg-secondary-light',
    textClass: 'text-secondary-dark',
  },
  doc: {
    label: 'Doc',
    icon: Folder,
    bgClass: 'bg-success-light',
    textClass: 'text-success-dark',
  },
  document: {
    label: 'Document',
    icon: Folder,
    bgClass: 'bg-success-light',
    textClass: 'text-success-dark',
  },
};

const DEFAULT_META: ResourceTypeMeta = {
  label: 'Resource',
  icon: FileText,
  bgClass: 'bg-disabled',
  textClass: 'text-text-secondary',
};

/** Options offered in the Add/Edit resource Type dropdown. */
export const RESOURCE_TYPE_OPTIONS = [
  { label: 'Article', value: 'Article' },
  { label: 'PDF', value: 'PDF' },
  { label: 'Video', value: 'Video' },
  { label: 'Document', value: 'Document' },
  { label: 'Link', value: 'Link' },
];

export function getResourceTypeMeta(
  type: string | null | undefined,
): ResourceTypeMeta {
  const key = (type ?? '').trim().toLowerCase();
  const known = KNOWN_TYPES[key];
  if (known) return known;
  return { ...DEFAULT_META, label: type?.trim() || DEFAULT_META.label };
}
