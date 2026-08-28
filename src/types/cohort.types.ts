export interface Cohort {
  id: number;
  name: string;
  description: string | null;
  isOpen: boolean;
  startDate: string;
  endDate: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CohortLearner {
  id: number;
  cohortId: number;
  learnerId: number;
  joinedAt: string;
  completedAt: string | null;
  isActive: boolean;
}

export interface CohortTrainer {
  id: number;
  cohortId: number;
  trainerId: number;
  assignedAt: string;
  removedAt: string | null;
}

export interface CreateCohortPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isOpen?: boolean;
}

export interface UpdateCohortPayload {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isOpen?: boolean;
}
