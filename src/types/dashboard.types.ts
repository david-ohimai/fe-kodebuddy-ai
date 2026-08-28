export type DashboardRole = 'admin' | 'learner' | 'trainer' | 'mentor';

export type DashboardUser = {
  name: string;
  email: string;
  avatarSrc?: string;
};

export const ROLE_HOME_HREF: Record<DashboardRole, string> = {
  admin: '/admin/dashboard',
  learner: '/dashboard',
  trainer: '/trainer/dashboard',
  mentor: '/mentor/dashboard',
};

export const ROLE_SETTINGS_HREF: Record<DashboardRole, string> = {
  admin: '/admin/settings',
  learner: '/settings',
  trainer: '/trainer/settings',
  mentor: '/mentor/settings',
};

export const ROLE_LABEL: Record<DashboardRole, string> = {
  admin: 'Admin',
  learner: 'Learner',
  trainer: 'Trainer',
  mentor: 'Mentor',
};

export interface CourseSummaryDto {
  id: number;
  title: string;
}

export interface CourseSummary {
  id: number;
  title: string;
}
