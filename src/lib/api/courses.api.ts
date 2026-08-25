import { apiFetch } from './client';
import type { CourseSummaryDto, CourseSummary } from '@/types/dashboard.types';

function mapCourseSummary(dto: CourseSummaryDto): CourseSummary {
  return { id: dto.id, title: dto.title };
}

export async function getMyCourses(): Promise<CourseSummary[]> {
  const dtos = await apiFetch<CourseSummaryDto[]>('/courses', {
    method: 'GET',
    auth: true,
  });
  return dtos.map(mapCourseSummary);
}
