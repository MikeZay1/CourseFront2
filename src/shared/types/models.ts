export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  bio?: string;
}

export interface StudentReview {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  startIso: string;
}

export interface Lesson {
  id: string;
  subject: string;
  tutor: Tutor;
  description: string;
  priceRub: number;
  durationMinutes: number;
  level: DifficultyLevel;
  availableSlots: TimeSlot[];
  reviews: StudentReview[];
  rating: number;
  coverImageUrl: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export type FavoriteTargetType = 'lesson' | 'tutor';

export interface FavoriteItem {
  type: FavoriteTargetType;
  id: string;
}

export interface DashboardPayload {
  recentLessons: Lesson[];
  popularTutors: Tutor[];
}

export interface LessonFilters {
  search: string;
  subject: string;
  level: '' | DifficultyLevel;
  priceMin: string;
  priceMax: string;
  durationMin: string;
  durationMax: string;
}
