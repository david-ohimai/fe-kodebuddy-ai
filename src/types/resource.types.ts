export type ResourceType =
  | 'Document'
  | 'Link'
  | 'Article'
  | 'Video'
  | 'Interactive';

export function normaliseResourceType(raw: string): ResourceType {
  const value = raw.trim().toLowerCase();
  if (value === 'link' || value.includes('link') || value.includes('url')) {
    return 'Link';
  }
  if (value === 'article' || value.includes('article')) {
    return 'Article';
  }
  if (
    value === 'file' ||
    value === 'document' ||
    value.includes('doc') ||
    value.includes('pdf')
  ) {
    return 'Document';
  }
  if (value.includes('video')) return 'Video';
  if (value.includes('interactive') || value.includes('exercise')) {
    return 'Interactive';
  }
  return 'Document';
}

export interface LearnerResource {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  type: ResourceType;
  rawType: string;
  url: string | null;
  content?: string | null;
  isActive: boolean;
  createdAt: string;
  moduleTitle: string;
  courseId: number;
  courseTitle: string;
}
