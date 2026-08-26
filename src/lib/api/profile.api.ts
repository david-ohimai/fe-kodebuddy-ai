import { apiFetch } from './client';
import { mapUser } from './auth.api';
import type {
  AuthUser,
  UserDto,
  UserResponseDto,
  UserRole,
} from '@/types/auth.types';

export async function listUsers(): Promise<AuthUser[]> {
  const dtos = await apiFetch<UserDto[]>('/profile/users', {
    method: 'GET',
    auth: true,
  });
  return dtos.map(mapUser);
}

export async function getUserById(userId: number): Promise<AuthUser> {
  const dto = await apiFetch<UserDto>(`/profile/users/${userId}`, {
    method: 'GET',
    auth: true,
  });
  return mapUser(dto);
}

export async function updateUserRole(
  userId: number,
  role: UserRole,
): Promise<AuthUser> {
  const res = await apiFetch<UserResponseDto>(`/profile/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
    auth: true,
  });
  return mapUser(res.user);
}
