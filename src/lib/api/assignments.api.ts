import { apiFetch } from './client';

export interface Assignment {
  id: string;
  title: string;
  moduleName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

interface AssignmentResponseDto {
  id: string;
  title: string;
  module_name: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

function mapAssignment(dto: AssignmentResponseDto): Assignment {
  return {
    id: dto.id,
    title: dto.title,
    moduleName: dto.module_name,
    dueDate: dto.due_date,
    status: dto.status,
  };
}

export async function listAssignmentsByModule(
  moduleId: number,
): Promise<Assignment[]> {
  const response = await apiFetch<AssignmentResponseDto[]>(
    `/modules/${moduleId}/assignments`,
    {
      method: 'GET',
      auth: true,
    },
  );

  return response.map(mapAssignment);
}