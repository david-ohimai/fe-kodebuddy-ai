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
