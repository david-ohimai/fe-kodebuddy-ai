import { FileText, File, Video, Link2, Folder } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ResourceTypeMeta {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

/**
 * The three values the backend's `ResourceType` enum actually accepts
 * (app/features/resources/model.py). They describe how a resource's text is
 * *sourced* for the AI index, not what it looks like to a learner:
 *
 * - `file`    — uploaded, then parsed (PDF/DOCX) by content_extraction.py
 * - `link`    — fetched and scraped server-side
 * - `article` — the `content` field is embedded directly, no fetching
 *
 * Richer labels (PDF, Video, Document) stay a presentation concern and are
 * derived from mime_type/url by `getResourceDisplayMeta` below — sending them
 * as the `type` was rejected outright by the enum.
 */
export const RESOURCE_TYPE_VALUES = ['article', 'link', 'file'] as const;

export type ResourceTypeValue = (typeof RESOURCE_TYPE_VALUES)[number];

/** Options offered in the Add/Edit resource Type dropdown. */
export const RESOURCE_TYPE_OPTIONS: {
  label: string;
  value: ResourceTypeValue;
}[] = [
  { label: 'Link', value: 'link' },
  { label: 'File upload', value: 'file' },
  { label: 'Article', value: 'article' },
];

export function isResourceTypeValue(
  value: string | null | undefined,
): value is ResourceTypeValue {
  return RESOURCE_TYPE_VALUES.includes(
    (value ?? '').trim().toLowerCase() as ResourceTypeValue,
  );
}

const ARTICLE_META: ResourceTypeMeta = {
  label: 'Article',
  icon: FileText,
  bgClass: 'bg-primary-light',
  textClass: 'text-primary',
};

const PDF_META: ResourceTypeMeta = {
  label: 'PDF',
  icon: File,
  bgClass: 'bg-error-light',
  textClass: 'text-error',
};

const VIDEO_META: ResourceTypeMeta = {
  label: 'Video',
  icon: Video,
  bgClass: 'bg-warning/15',
  textClass: 'text-warning',
};

const LINK_META: ResourceTypeMeta = {
  label: 'Link',
  icon: Link2,
  bgClass: 'bg-secondary-light',
  textClass: 'text-secondary-dark',
};

const DOCUMENT_META: ResourceTypeMeta = {
  label: 'Document',
  icon: Folder,
  bgClass: 'bg-success-light',
  textClass: 'text-success-dark',
};

const KNOWN_TYPES: Record<string, ResourceTypeMeta> = {
  article: ARTICLE_META,
  pdf: PDF_META,
  video: VIDEO_META,
  link: LINK_META,
  file: DOCUMENT_META,
  doc: DOCUMENT_META,
  document: DOCUMENT_META,
};

const DEFAULT_META: ResourceTypeMeta = {
  label: 'Resource',
  icon: FileText,
  bgClass: 'bg-disabled',
  textClass: 'text-text-secondary',
};

const VIDEO_HOST_PATTERN =
  /(youtube\.com|youtu\.be|vimeo\.com|loom\.com|wistia\.com)/i;

export interface ResourceDisplaySource {
  type: string | null | undefined;
  mimeType?: string | null;
  url?: string | null;
  fileName?: string | null;
}

/**
 * Display meta for a resource, given the backend's coarse `type` plus the
 * detail that narrows it. A `file` resource is a PDF, a doc, or a video
 * depending on its mime type; a `link` to YouTube is a video rather than a
 * generic link. This is what lets the UI keep the specific labels/icons the
 * design calls for while still only ever sending the three real enum values.
 */
export function getResourceDisplayMeta({
  type,
  mimeType,
  url,
  fileName,
}: ResourceDisplaySource): ResourceTypeMeta {
  const normalisedType = (type ?? '').trim().toLowerCase();
  const mime = (mimeType ?? '').trim().toLowerCase();
  const name = (fileName ?? '').trim().toLowerCase();

  if (normalisedType === 'file') {
    if (mime.includes('pdf') || name.endsWith('.pdf')) return PDF_META;
    if (mime.startsWith('video/')) return VIDEO_META;
    // Everything else parseable (DOCX, ODT, plain text) reads as a document.
    return DOCUMENT_META;
  }

  if (normalisedType === 'link') {
    if (url && VIDEO_HOST_PATTERN.test(url)) return VIDEO_META;
    return LINK_META;
  }

  if (normalisedType === 'article') return ARTICLE_META;

  return getResourceTypeMeta(type);
}

export function getResourceTypeMeta(
  type: string | null | undefined,
): ResourceTypeMeta {
  const key = (type ?? '').trim().toLowerCase();
  const known = KNOWN_TYPES[key];
  if (known) return known;
  return { ...DEFAULT_META, label: type?.trim() || DEFAULT_META.label };
}
