import { apiFetch } from './client';

export async function getTrainerDashboard(): Promise<unknown> {
  return apiFetch<unknown>('/dashboard/trainer', {
    method: 'GET',
    auth: true,
  });
}

export async function getMentorDashboard(): Promise<unknown> {
  return apiFetch<unknown>('/dashboard/mentor', { method: 'GET', auth: true });
}
