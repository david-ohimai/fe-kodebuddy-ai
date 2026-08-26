import { apiFetch } from './client';

export interface Cohort {
  id: number;
  name: string;
  description: string | null;
  isOpen: boolean;
  startDate: string;
  endDate: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface CohortResponseDto {
  id: number;
  name: string;
  description: string | null;
  is_open: boolean;
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

function mapCohort(dto: CohortResponseDto): Cohort {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isOpen: dto.is_open,
    startDate: dto.start_date,
    endDate: dto.end_date,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listCohorts(limit = 200): Promise<Cohort[]> {
  const dtos = await apiFetch<CohortResponseDto[]>(
    `/cohorts?skip=0&limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return dtos.map(mapCohort);
}
