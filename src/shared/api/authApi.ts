import { apiClient } from '@/shared/api/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/shared/types/models';

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', body);
  return data;
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', body);
  return data;
}
