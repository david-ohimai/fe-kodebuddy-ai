import { apiFetch } from './client';

// Minimal for now — only what's needed to show a real assignment count
// on the Overview tab. Full CRUD (create/edit/grade) will follow once
// the Assignments tab design is available.
export interface Assignment {
  id: number;
  moduleId: number;
  title: string;
}

interface AssignmentResponseDto {
  id: number;
  module_id: number;
  title: string;
  [key: string]: unknown;
}

/** GET /modules/{module_id}/assignments */
export async function listModuleAssignments(
  moduleId: number,
): Promise<Assignment[]> {
  const dtos = await apiFetch<AssignmentResponseDto[]>(
    `/modules/${moduleId}/assignments`,
    { method: 'GET', auth: true },
  );
  return dtos.map((dto) => ({
    id: dto.id,
    moduleId: dto.module_id,
    title: dto.title,
  }));
}
