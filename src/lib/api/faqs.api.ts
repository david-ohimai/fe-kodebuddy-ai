import { apiFetch } from './client';

export const FAQ_RESOURCE_TYPE = 'faq';

export interface Faq {
  id: number;
  moduleId: number;
  question: string;
  answer: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface ResourceResponseDto {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export function isFaqResourceType(type: string | null | undefined): boolean {
  return (type ?? '').trim().toLowerCase() === FAQ_RESOURCE_TYPE;
}

function mapFaq(dto: ResourceResponseDto): Faq {
  return {
    id: dto.id,
    moduleId: dto.module_id,
    question: dto.title,
    answer: dto.description,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    isActive: dto.is_active,
  };
}

export async function listModuleFaqs(moduleId: number): Promise<Faq[]> {
  const dtos = await apiFetch<ResourceResponseDto[]>(
    `/modules/${moduleId}/resources`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).filter((dto) => isFaqResourceType(dto.type)).map(mapFaq);
}

export async function createFaq(
  moduleId: number,
  input: { question: string; answer?: string },
): Promise<Faq> {
  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources`,
    {
      method: 'POST',
      auth: true,
      body: {
        title: input.question,
        description: input.answer,
        type: FAQ_RESOURCE_TYPE,
      },
    },
  );
  return mapFaq(dto);
}

export async function updateFaq(
  moduleId: number,
  faqId: number,
  input: { question?: string; answer?: string },
): Promise<Faq> {
  const dto = await apiFetch<ResourceResponseDto>(
    `/modules/${moduleId}/resources/${faqId}`,
    {
      method: 'PATCH',
      auth: true,
      body: {
        title: input.question,
        description: input.answer,
      },
    },
  );
  return mapFaq(dto);
}

export async function deleteFaq(
  moduleId: number,
  faqId: number,
): Promise<void> {
  await apiFetch<void>(`/modules/${moduleId}/resources/${faqId}`, {
    method: 'DELETE',
    auth: true,
  });
}
