import { apiFetch } from './client';

export interface AssignedLearner {
  learnerId: number;
  fullName: string | null;
  email: string;
  assignedAt: string;
}

interface AssignedLearnerSummaryDto {
  learner_id: number;
  full_name: string | null;
  email: string;
  assigned_at: string;
}

function mapAssignedLearner(dto: AssignedLearnerSummaryDto): AssignedLearner {
  return {
    learnerId: dto.learner_id,
    fullName: dto.full_name,
    email: dto.email,
    assignedAt: dto.assigned_at,
  };
}

export async function listMyAssignedLearners(): Promise<AssignedLearner[]> {
  const dtos = await apiFetch<AssignedLearnerSummaryDto[]>(
    '/mentors/learners',
    {
      method: 'GET',
      auth: true,
    },
  );
  return (dtos ?? []).map(mapAssignedLearner);
}

interface MentorLearnerResponseDto {
  id: number;
  mentor_id: number;
  learner_id: number;
  assigned_at: string;
}

export async function assignLearnerToMentor(
  mentorId: number,
  learnerId: number,
): Promise<void> {
  await apiFetch<MentorLearnerResponseDto>(`/mentors/${mentorId}/learners`, {
    method: 'POST',
    auth: true,
    body: { learner_id: learnerId },
  });
}

export interface LearnerCourseProgress {
  courseId: number;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
}

export async function getLearnerCourseProgress(
  learnerId: number,
  courseId: number,
): Promise<LearnerCourseProgress> {
  const dto = await apiFetch<{
    course_id: number;
    total_modules: number;
    total_lessons: number;
    completed_lessons: number;
    completion_percentage: number;
  }>(`/mentors/learners/${learnerId}/courses/${courseId}/progress`, {
    method: 'GET',
    auth: true,
  });
  return {
    courseId: dto.course_id,
    totalModules: dto.total_modules,
    totalLessons: dto.total_lessons,
    completedLessons: dto.completed_lessons,
    completionPercentage: dto.completion_percentage,
  };
}

export interface LearnerModuleProgress {
  moduleId: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
}

export async function getLearnerModuleProgress(
  learnerId: number,
  moduleId: number,
): Promise<LearnerModuleProgress> {
  const dto = await apiFetch<{
    module_id: number;
    total_lessons: number;
    completed_lessons: number;
    completion_percentage: number;
  }>(`/mentors/learners/${learnerId}/modules/${moduleId}/progress`, {
    method: 'GET',
    auth: true,
  });
  return {
    moduleId: dto.module_id,
    totalLessons: dto.total_lessons,
    completedLessons: dto.completed_lessons,
    completionPercentage: dto.completion_percentage,
  };
}

export interface LearnerSubmission {
  id: number;
  assignmentId: number;
  content: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

interface SubmissionResponseDto {
  id: number;
  assignment_id: number;
  learner_id: number;
  content: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  graded_by: number | null;
  graded_at: string | null;
}

export async function listLearnerSubmissions(
  learnerId: number,
): Promise<LearnerSubmission[]> {
  const dtos = await apiFetch<SubmissionResponseDto[]>(
    `/mentors/learners/${learnerId}/submissions`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map((dto) => ({
    id: dto.id,
    assignmentId: dto.assignment_id,
    content: dto.content,
    submittedAt: dto.submitted_at,
    score: dto.score,
    feedback: dto.feedback,
    gradedAt: dto.graded_at,
  }));
}

export type CheckInStatus = 'upcoming' | 'completed';

export interface CheckIn {
  id: number;
  mentorId: number;
  learnerId: number;
  scheduledTime: string;
  status: CheckInStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CheckInResponseDto {
  id: number;
  mentor_id: number;
  learner_id: number;
  scheduled_time: string;
  status: CheckInStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapCheckIn(dto: CheckInResponseDto): CheckIn {
  return {
    id: dto.id,
    mentorId: dto.mentor_id,
    learnerId: dto.learner_id,
    scheduledTime: dto.scheduled_time,
    status: dto.status,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listMyCheckIns(): Promise<CheckIn[]> {
  const dtos = await apiFetch<CheckInResponseDto[]>('/mentors/check-ins', {
    method: 'GET',
    auth: true,
  });
  return (dtos ?? []).map(mapCheckIn);
}

export async function listLearnerCheckIns(
  learnerId: number,
): Promise<CheckIn[]> {
  const dtos = await apiFetch<CheckInResponseDto[]>(
    `/mentors/learners/${learnerId}/check-ins`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapCheckIn);
}

export async function createCheckIn(input: {
  learnerId: number;
  scheduledTime: string;
  notes?: string;
}): Promise<CheckIn> {
  const dto = await apiFetch<CheckInResponseDto>('/mentors/check-ins', {
    method: 'POST',
    auth: true,
    body: {
      learner_id: input.learnerId,
      scheduled_time: input.scheduledTime,
      notes: input.notes,
    },
  });
  return mapCheckIn(dto);
}

export async function updateCheckIn(
  checkInId: number,
  input: { scheduledTime?: string; status?: CheckInStatus; notes?: string },
): Promise<CheckIn> {
  const dto = await apiFetch<CheckInResponseDto>(
    `/mentors/check-ins/${checkInId}`,
    {
      method: 'PATCH',
      auth: true,
      body: {
        scheduled_time: input.scheduledTime,
        status: input.status,
        notes: input.notes,
      },
    },
  );
  return mapCheckIn(dto);
}
