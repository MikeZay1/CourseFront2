import { apiClient } from '@/shared/api/client';
import type { DashboardPayload, Lesson } from '@/shared/types/models';

export async function fetchDashboard(): Promise<DashboardPayload> {
  const { data } = await apiClient.get<DashboardPayload>('/dashboard');
  return data;
}

export async function fetchLessons(params: Record<string, string>): Promise<Lesson[]> {
  const { data } = await apiClient.get<Lesson[]>('/lessons', { params });
  return data;
}

export async function fetchLesson(id: string): Promise<Lesson> {
  const { data } = await apiClient.get<Lesson>(`/lessons/${id}`);
  return data;
}

export async function createLesson(body: Omit<Lesson, 'id' | 'createdAt'>): Promise<Lesson> {
  const { data } = await apiClient.post<Lesson>('/lessons', body);
  return data;
}

export async function updateLesson(id: string, body: Partial<Lesson>): Promise<Lesson> {
  const { data } = await apiClient.put<Lesson>(`/lessons/${id}`, body);
  return data;
}

export async function deleteLesson(id: string): Promise<void> {
  await apiClient.delete(`/lessons/${id}`);
}
