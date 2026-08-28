import { apiFetch } from './client';
import { mapUser } from './auth.api';
import type { CreateCohortPayload } from '@/types/cohort.types';
import type { UserDto } from '@/types/auth.types';

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

export interface CohortLearner {
  id: number;
  learnerId: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  isActive: boolean;
  joinedAt?: string;
}

export interface CohortTrainer {
  id: number;
  cohortId: number;
  trainerId: number;
  assignedAt: string;
  removedAt: string | null;
}

interface CohortLearnerResponseDto {
  id: number;
  cohort_id: number;
  learner_id: number;
  joined_at: string;
  completed_at: string | null;
  is_active: boolean;
}

interface CohortTrainerResponseDto {
  id: number;
  cohort_id: number;
  trainer_id: number;
  assigned_at: string;
  removed_at: string | null;
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

export async function createCohort(
  payload: CreateCohortPayload,
): Promise<Cohort> {
  const dto = await apiFetch<CohortResponseDto>('/cohorts', {
    method: 'POST',
    auth: true,
    body: {
      name: payload.name,
      description: payload.description,
      start_date: payload.startDate,
      end_date: payload.endDate,
      is_open: payload.isOpen,
    },
  });

  return mapCohort(dto);
}

export async function getCohortById(cohortId: number): Promise<Cohort> {
  const dto = await apiFetch<CohortResponseDto>(`/cohorts/${cohortId}`, {
    method: 'GET',
    auth: true,
  });
  return mapCohort(dto);
}

export async function listCohortLearners(
  cohortId: number,
): Promise<CohortLearner[]> {
  const [enrollments, users] = await Promise.all([
    apiFetch<CohortLearnerResponseDto[]>(
      `/assign-cohorts/${cohortId}/learners`,
      { method: 'GET', auth: true },
    ),
    apiFetch<UserDto[]>('/profile/users', { method: 'GET', auth: true }),
  ]);

  const usersById = new Map(users.map((user) => [user.id, mapUser(user)]));

  return enrollments.map((enrollment) => {
    const user = usersById.get(enrollment.learner_id);
    return {
      id: enrollment.id,
      learnerId: enrollment.learner_id,
      fullName: user?.fullName ?? null,
      email: user?.email ?? '—',
      createdAt: user?.createdAt ?? enrollment.joined_at,
      isActive: enrollment.is_active && (user?.isActive ?? true),
      joinedAt: enrollment.joined_at,
    };
  });
export interface CohortTrainer {
  id: number;
  cohortId: number;
  trainerId: number;
  assignedAt: string;
  removedAt: string | null;
}

interface CohortTrainerResponseDto {
  id: number;
  cohort_id: number;
  trainer_id: number;
  assigned_at: string;
  removed_at: string | null;
}

function mapCohortTrainer(dto: CohortTrainerResponseDto): CohortTrainer {
  return {
    id: dto.id,
    cohortId: dto.cohort_id,
    trainerId: dto.trainer_id,
    assignedAt: dto.assigned_at,
    removedAt: dto.removed_at,
  };
}

export async function listCohortTrainers(
export async function getCohortTrainers(
  cohortId: number,
): Promise<CohortTrainer[]> {
  const dtos = await apiFetch<CohortTrainerResponseDto[]>(
    `/assign-cohorts/${cohortId}/trainers`,
    { method: 'GET', auth: true },
  );
  return dtos.map(mapCohortTrainer);
}

export async function assignCohortTrainer(
  cohortId: number,
  trainerId: number,
): Promise<CohortTrainer> {
  const dto = await apiFetch<CohortTrainerResponseDto>(
    `/assign-cohorts/${cohortId}/trainer`,
    {
      method: 'POST',
      auth: true,
      body: { trainer_id: trainerId },
    },
  );
  return mapCohortTrainer(dto);
export interface CohortLearner {
  id: number;
  cohortId: number;
  learnerId: number;
  joinedAt: string;
  completedAt: string | null;
  isActive: boolean;
}

interface CohortLearnerResponseDto {
  id: number;
  cohort_id: number;
  learner_id: number;
  joined_at: string;
  completed_at: string | null;
  is_active: boolean;
}

function mapCohortLearner(dto: CohortLearnerResponseDto): CohortLearner {
  return {
    id: dto.id,
    cohortId: dto.cohort_id,
    learnerId: dto.learner_id,
    joinedAt: dto.joined_at,
    completedAt: dto.completed_at,
    isActive: dto.is_active,
  };
}

export async function getCohortLearners(
  cohortId: number,
): Promise<CohortLearner[]> {
  const dtos = await apiFetch<CohortLearnerResponseDto[]>(
    `/assign-cohorts/${cohortId}/learners`,
    { method: 'GET', auth: true },
  );
  return dtos.map(mapCohortLearner);
}
