import { apiFetch } from './client';

export interface Submission {
  id: number;
  assignmentId: number;
  learnerId: number;
  content: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  gradedBy: number | null;
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

export const SUBMISSION_CONTENT_MAX_LENGTH = 1000;

function mapSubmission(dto: SubmissionResponseDto): Submission {
  return {
    id: dto.id,
    assignmentId: dto.assignment_id,
    learnerId: dto.learner_id,
    content: dto.content,
    submittedAt: dto.submitted_at,
    score: dto.score,
    feedback: dto.feedback,
    gradedBy: dto.graded_by,
    gradedAt: dto.graded_at,
  };
}

export async function listMySubmissions(): Promise<Submission[]> {
  const dtos = await apiFetch<SubmissionResponseDto[]>('/submissions/me', {
    method: 'GET',
    auth: true,
  });
  return (dtos ?? []).map(mapSubmission);
}

export async function createSubmission(
  assignmentId: number,
  content: string,
): Promise<Submission> {
  const dto = await apiFetch<SubmissionResponseDto>('/submissions/', {
    method: 'POST',
    auth: true,
    body: { assignment_id: assignmentId, content },
  });
  return mapSubmission(dto);
}
