import { apiFetch } from './client';
import type {
  AuthUser,
  LoginResponseDto,
  MessageResponseDto,
  RefreshTokenResponseDto,
  SignInResult,
  SignUpResult,
  UserDto,
  UserResponseDto,
} from '@/types/auth.types';

export function mapUser(dto: UserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.full_name,
    role: dto.role,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    courseId: dto.course_id ?? null,
  };
}

export async function signUp(input: {
  email: string;
  password: string;
}): Promise<SignUpResult> {
  const res = await apiFetch<UserResponseDto>('/user/register', {
    method: 'POST',
    body: { email: input.email, password: input.password },
  });
  return { message: res.message, user: mapUser(res.user) };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const res = await apiFetch<LoginResponseDto>('/user/login', {
    method: 'POST',
    body: { email: input.email, password: input.password },
  });
  return {
    message: res.message,
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    user: mapUser(res.user),
  };
}

export async function refreshAccessToken(input: { refreshToken: string }) {
  const res = await apiFetch<RefreshTokenResponseDto>('/user/refresh', {
    method: 'POST',
    body: { refresh_token: input.refreshToken },
  });
  return { accessToken: res.access_token, refreshToken: res.refresh_token };
}

export async function updateProfile(input: { fullName: string }) {
  const res = await apiFetch<UserResponseDto>('/profile/update-profile', {
    method: 'PATCH',
    body: { full_name: input.fullName },
    auth: true,
  });
  return { message: res.message, user: mapUser(res.user) };
}

export async function getCurrentProfile(): Promise<AuthUser> {
  const dto = await apiFetch<UserDto>('/profile/profile-me', {
    method: 'GET',
    auth: true,
  });
  return mapUser(dto);
}

export async function forgotPassword(input: { email: string }) {
  return apiFetch<MessageResponseDto>('/user/forgot-password', {
    method: 'POST',
    body: { email: input.email },
  });
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}) {
  return apiFetch<MessageResponseDto>('/user/reset-password', {
    method: 'POST',
    body: { token: input.token, new_password: input.newPassword },
  });
}
