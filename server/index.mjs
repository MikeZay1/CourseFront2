import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const seedPath = path.join(root, 'data', 'lessons.seed.json');
const statePath = path.join(root, 'server', 'data', 'state.json');

function loadSeedLessons() {
  const raw = fs.readFileSync(seedPath, 'utf8');
  return JSON.parse(raw);
}

function readState() {
  if (!fs.existsSync(statePath)) {
    const initial = { lessons: loadSeedLessons(), users: {} };
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeState(state) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

function makeToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email })).toString('base64');
  return `${header}.${payload}.mock-signature`;
}

function parsePath(url) {
  const u = url.replace(/^https?:\/\/[^/]+/, '');
  const [pathPart, qs] = u.split('?');
  return { path: pathPart || '/', query: new URLSearchParams(qs || '') };
}

function dispatch(state, method, url, body) {
  const { path, query } = parsePath(url);
  const lessons = state.lessons;
  const users = state.users;

  if (path === '/auth/login' && method === 'POST') {
    const entry = users[body.email];
    if (!entry || entry.password !== body.password) {
      return { status: 401, data: { message: 'Неверный email или пароль' } };
    }
    return { status: 200, data: { accessToken: makeToken(entry.user), user: entry.user } };
  }

  if (path === '/auth/register' && method === 'POST') {
    if (users[body.email]) {
      return { status: 409, data: { message: 'Пользователь уже существует' } };
    }
    const user = {
      id: `u-${randomUUID()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    };
    users[body.email] = { password: body.password, user };
    return { status: 201, data: { accessToken: makeToken(user), user } };
  }

  if (path === '/dashboard' && method === 'GET') {
    const recent = [...lessons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 4);
    const tutorMap = new Map();
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
      const merged = { ...lessons[idx], ...body, id: lessons[idx].id };
      lessons[idx] = merged;
      return { status: 200, data: merged };
    }
    if (method === 'DELETE') {
      const next = lessons.filter((l) => l.id !== id);
      if (next.length === lessons.length) return { status: 404, data: { message: 'Не найдено' } };
      state.lessons = next;
      return { status: 204, data: null };
    }
  }

  if (path === '/lessons' && method === 'POST') {
    const lesson = {
      ...body,
      id: `l-${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    lessons.unshift(lesson);
    return { status: 201, data: lesson };
  }

  return { status: 404, data: { message: 'Неизвестный маршрут' } };
}

const app = express();
const port = Number(process.env.API_PORT || 4000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use((req, res) => {
  const state = readState();
  const result = dispatch(state, req.method.toUpperCase(), req.originalUrl, req.body || {});
  writeState(state);
  if (result.status === 204) {
    res.status(204).end();
    return;
  }
  res.status(result.status).json(result.data);
});

app.listen(port, () => {
  console.log(`Tutoring API listening on http://localhost:${port}`);
});
