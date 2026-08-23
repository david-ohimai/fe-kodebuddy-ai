export type SignUpFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export type SignInFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export const LEARNING_GOALS = [
  { value: 'building_new_skills', label: 'Building new skills' },
  { value: 'improving_existing_skills', label: 'Improving existing skills' },
  { value: 'prepare_for_career', label: 'Prepare for a career' },
  { value: 'complete_a_course', label: 'Complete a course' },
  { value: 'others', label: 'Others' },
] as const;

export type LearningGoal = (typeof LEARNING_GOALS)[number]['value'];

export const LEARNING_INTERESTS = [
  'Web development',
  'Product design',
  'Mobile development',
  'Cyber security',
  'Project management',
  'Communication skills',
  'Data analytics',
  'Cloud & dev ops',
] as const;

export type LearningInterest = (typeof LEARNING_INTERESTS)[number];

export type OnboardingFormValues = {
  learningGoal: LearningGoal | null;
  interests: string[];
};

export type UserRole = 'learner' | 'trainer' | 'mentor' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface SignUpResult {
  message: string;
  user: AuthUser;
}

export interface SignInResult {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserDto {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserResponseDto {
  message: string;
  user: UserDto;
}

export interface LoginResponseDto {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserDto;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
}

export interface MessageResponseDto {
  message: string;
}
