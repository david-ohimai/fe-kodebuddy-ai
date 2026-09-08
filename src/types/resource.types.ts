export type ResourceType = 'Video' | 'Article' | 'Document' | 'Interactive';

const VIDEO_HOST_PATTERN =
  /(youtube\.com|youtu\.be|vimeo\.com|loom\.com|wistia\.com)/i;

export interface ResourceTypeContext {
  url?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
}

/**
 * Maps the backend's coarse resource type onto the categories the learner
 * Resources page filters by.
 *
 * The backend enum is only `file | article | link` — those describe how the
 * text is sourced for the AI index, not what the thing is. So a YouTube
 * `link` and a `file` that happens to be an MP4 both have to be recognised as
 * videos here, or they land under "Documents" and the Video filter stays
 * permanently empty.
 */
export function normaliseResourceType(
  raw: string,
  context: ResourceTypeContext = {},
): ResourceType {
  const value = raw.trim().toLowerCase();
  const mime = (context.mimeType ?? '').trim().toLowerCase();

  if (value.includes('video') || mime.startsWith('video/')) return 'Video';
  if (value === 'link' && context.url && VIDEO_HOST_PATTERN.test(context.url)) {
    return 'Video';
  }
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
  /** Present for `file` resources — narrows the display type (PDF vs doc). */
  fileName: string | null;
  mimeType: string | null;
  isActive: boolean;
  createdAt: string;
  moduleTitle: string;
  courseId: number;
  courseTitle: string;
}
