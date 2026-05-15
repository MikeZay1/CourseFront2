import type { AuthResponse, AuthUser, Lesson, RegisterRequest, Tutor } from '@/shared/types/models';
import rawLessons from '../../../data/lessons.seed.json';

const LESSONS_KEY = 'tutoring_lessons_v1';
const USERS_KEY = 'tutoring_mock_users_v1';

export const SEED_LESSONS = rawLessons as Lesson[];

type StoredUser = { password: string; user: AuthUser };

function readUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

function writeUsers(map: Record<string, StoredUser>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}

function readLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) {
      localStorage.setItem(LESSONS_KEY, JSON.stringify(SEED_LESSONS));
      return [...SEED_LESSONS];
    }
    const parsed = JSON.parse(raw) as Lesson[];
    return migrateLessonsMedia(parsed);
  } catch {
    return [...SEED_LESSONS];
  }
}

/** Старые демо-URL picsum часто не грузятся; заменяем на локальные SVG. */
function migrateLessonsMedia(lessons: Lesson[]): Lesson[] {
  let changed = false;
  const next = lessons.map((l, i) => {
    let nl = l;
    const idx = (i % 6) + 1;
    if (l.coverImageUrl?.includes('picsum.photos')) {
      changed = true;
      nl = { ...nl, coverImageUrl: `placeholders/cover-${idx}.svg` };
    }
    if (l.tutor.avatarUrl?.includes('picsum.photos')) {
      changed = true;
      nl = {
        ...nl,
        tutor: { ...nl.tutor, avatarUrl: `placeholders/avatar-${idx}.svg` },
      };
    }
    return nl;
  });
  if (changed) {
    writeLessons(next);
  }
  return next;
}

function writeLessons(lessons: Lesson[]): void {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
}

function makeToken(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: user.id, email: user.email }));
  return `${header}.${payload}.mock-signature`;
}

function parsePath(url: string): { path: string; query: URLSearchParams } {
  const u = url.replace(/^https?:\/\/[^/]+/, '');
  const [pathPart, qs] = u.split('?');
  return { path: pathPart || '/', query: new URLSearchParams(qs || '') };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function handleMockRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<{ status: number; data: unknown }> {
  await delay(220);
  const { path, query } = parsePath(url);
  const lessons = readLessons();

  if (path === '/auth/login' && method === 'POST') {
    const body = data as { email: string; password: string };
    const users = readUsers();
    const entry = users[body.email];
    if (!entry || entry.password !== body.password) {
      return { status: 401, data: { message: 'Неверный email или пароль' } };
    }
    const res: AuthResponse = { accessToken: makeToken(entry.user), user: entry.user };
    return { status: 200, data: res };
  }

  if (path === '/auth/register' && method === 'POST') {
    const body = data as RegisterRequest;
    const users = readUsers();
    if (users[body.email]) {
      return { status: 409, data: { message: 'Пользователь уже существует' } };
    }
    const user: AuthUser = {
      id: `u-${crypto.randomUUID()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    };
    users[body.email] = { password: body.password, user };
    writeUsers(users);
    const res: AuthResponse = { accessToken: makeToken(user), user };
    return { status: 201, data: res };
  }

  if (path === '/dashboard' && method === 'GET') {
    const recent = [...lessons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 4);
    const tutorMap = new Map<string, Tutor>();
    lessons.forEach((l) => tutorMap.set(l.tutor.id, l.tutor));
    const popular = [...tutorMap.values()]
      .map((t) => ({
        t,
        score: lessons.filter((l) => l.tutor.id === t.id).reduce((s, l) => s + l.rating, 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.t);
    return { status: 200, data: { recentLessons: recent, popularTutors: popular } };
  }

  if (path === '/lessons' && method === 'GET') {
    const search = (query.get('search') || '').toLowerCase();
    const subject = query.get('subject') || '';
    const level = query.get('level') || '';
    const priceMin = Number(query.get('priceMin') || NaN);
    const priceMax = Number(query.get('priceMax') || NaN);
    const durationMin = Number(query.get('durationMin') || NaN);
    const durationMax = Number(query.get('durationMax') || NaN);

    const filtered = lessons.filter((l) => {
      const hay = `${l.subject} ${l.tutor.firstName} ${l.tutor.lastName}`.toLowerCase();
      if (search && !hay.includes(search)) return false;
      if (subject && l.subject !== subject) return false;
      if (level && l.level !== level) return false;
      if (!Number.isNaN(priceMin) && l.priceRub < priceMin) return false;
      if (!Number.isNaN(priceMax) && l.priceRub > priceMax) return false;
      if (!Number.isNaN(durationMin) && l.durationMinutes < durationMin) return false;
      if (!Number.isNaN(durationMax) && l.durationMinutes > durationMax) return false;
      return true;
    });
    return { status: 200, data: filtered };
  }

  const lessonMatch = path.match(/^\/lessons\/([^/]+)$/);
  if (lessonMatch) {
    const id = lessonMatch[1];
    if (method === 'GET') {
      const lesson = lessons.find((l) => l.id === id);
      if (!lesson) return { status: 404, data: { message: 'Занятие не найдено' } };
      return { status: 200, data: lesson };
    }
    if (method === 'PUT') {
      const idx = lessons.findIndex((l) => l.id === id);
      if (idx < 0) return { status: 404, data: { message: 'Занятие не найдено' } };
      const body = data as Partial<Lesson>;
      const merged: Lesson = { ...lessons[idx], ...body, id: lessons[idx].id };
      lessons[idx] = merged;
      writeLessons(lessons);
      return { status: 200, data: merged };
    }
    if (method === 'DELETE') {
      const next = lessons.filter((l) => l.id !== id);
      if (next.length === lessons.length) return { status: 404, data: { message: 'Не найдено' } };
      writeLessons(next);
      return { status: 204, data: null };
    }
  }

  if (path === '/lessons' && method === 'POST') {
    const body = data as Omit<Lesson, 'id' | 'createdAt'>;
    const lesson: Lesson = {
      ...body,
      id: `l-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    lessons.unshift(lesson);
    writeLessons(lessons);
    return { status: 201, data: lesson };
  }

  return { status: 404, data: { message: 'Неизвестный маршрут' } };
}

export function subjectsCatalog(lessons: Lesson[]): string[] {
  return [...new Set(lessons.map((l) => l.subject))].sort();
}
