export type DashboardRole = 'admin' | 'learner';

export type DashboardUser = {
  name: string;
  email: string;
  avatarSrc?: string;
};
export interface CourseSummaryDto {
  id: number;
  title: string;
}

export interface CourseSummary {
  id: number;
  title: string;
}
