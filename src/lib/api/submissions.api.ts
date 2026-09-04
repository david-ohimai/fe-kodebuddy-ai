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

/**
 * PATCH /submissions/{id} — a learner editing their own, still-ungraded
 * submission. Content only; there's nothing else on SubmissionUpdate.
 */
export async function updateSubmission(
  submissionId: number,
  content: string,
): Promise<Submission> {
  const dto = await apiFetch<SubmissionResponseDto>(
    `/submissions/${submissionId}`,
    { method: 'PATCH', auth: true, body: { content } },
  );
  return mapSubmission(dto);
}

/** DELETE /submissions/{id} — withdraws a submission entirely, back to "not submitted". */
export async function deleteSubmission(submissionId: number): Promise<void> {
  await apiFetch<unknown>(`/submissions/${submissionId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function listAssignmentSubmissions(
  assignmentId: number,
): Promise<Submission[]> {
  const dtos = await apiFetch<SubmissionResponseDto[]>(
    `/submissions/assignment/${assignmentId}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapSubmission);
}

export const FEEDBACK_MAX_LENGTH = 1000;

export async function gradeSubmission(
  submissionId: number,
  input: { score: number; feedback?: string },
): Promise<Submission> {
  const dto = await apiFetch<SubmissionResponseDto>(
    `/submissions/${submissionId}/grade`,
    {
      method: 'PATCH',
      auth: true,
      body: { score: input.score, feedback: input.feedback },
    },
  );
  return mapSubmission(dto);
}
