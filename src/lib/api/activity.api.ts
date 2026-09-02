import { apiFetch } from './client';

export type ActivityType =
  | 'lesson_completed'
  | 'assignment_submitted'
  | 'assignment_graded'
  | 'progress_updated'
  | 'check_in_completed';

export interface ActivityEntry {
  id: number;
  userId: number;
  activityType: ActivityType;
  title: string;
  description: string | null;
  createdAt: string;
}

interface ActivityResponseDto {
  id: number;
  user_id: number;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  created_at: string;
}

function mapActivity(dto: ActivityResponseDto): ActivityEntry {
  return {
    id: dto.id,
    userId: dto.user_id,
    activityType: dto.activity_type,
    title: dto.title,
    description: dto.description,
    createdAt: dto.created_at,
  };
}

export async function listTrainerActivity(
  limit = 100,
): Promise<ActivityEntry[]> {
  const dtos = await apiFetch<ActivityResponseDto[]>(
    `/activity/trainer?limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapActivity);
}

export async function listAdminActivity(limit = 20): Promise<ActivityEntry[]> {
  const dtos = await apiFetch<ActivityResponseDto[]>(
    `/activity/admin?limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapActivity);
}

export async function listMentorActivity(limit = 20): Promise<ActivityEntry[]> {
  const dtos = await apiFetch<ActivityResponseDto[]>(
    `/activity/mentor?limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapActivity);
}

export async function listMyActivity(limit = 20): Promise<ActivityEntry[]> {
  const dtos = await apiFetch<ActivityResponseDto[]>(
    `/activity/learner?limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapActivity);
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  lesson_completed: 'completed a lesson',
  assignment_submitted: 'submitted an assignment',
  assignment_graded: 'had an assignment graded',
  progress_updated: 'updated their progress',
  check_in_completed: 'completed a check-in',
};
