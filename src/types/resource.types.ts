export type ResourceType = 'Video' | 'Article' | 'Document' | 'Interactive';

export function normaliseResourceType(raw: string): ResourceType {
  const value = raw.trim().toLowerCase();
  if (value.includes('video')) return 'Video';
  if (value.includes('interactive') || value.includes('exercise')) {
    return 'Interactive';
  }
  if (value.includes('article')) return 'Article';
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
