/**
 * Публичные файлы из `public/` (лежат в корне деплоя).
 *
 * При Vite `base: './'` относительный `<img src="./placeholders/...">` на вложенных маршрутах
 * резолвится от pathname (например /Repo/lessons/id → /Repo/lessons/placeholders/... — 404).
 * Для GitHub Pages задаём абсолютный префикс `VITE_ROUTER_BASENAME` (= /Repo без слэша в конце).
 */
export function resolveLessonMediaUrl(url: string | undefined | null): string {
  if (!url || !url.trim()) {
    return publicAssetPath('placeholders/cover-default.svg');
  }
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) {
    return u;
  }
  return publicAssetPath(u.replace(/^\//, ''));
}

function publicAssetPath(relativePath: string): string {
  const path = relativePath.replace(/^\//, '').replace(/\/+/g, '/');

  const repoBase = import.meta.env.VITE_ROUTER_BASENAME?.trim();
  if (repoBase) {
    const prefix = (repoBase.startsWith('/') ? repoBase : `/${repoBase}`).replace(/\/+$/, '');
    return `${prefix}/${path}`;
  }

  const base = import.meta.env.BASE_URL || '/';
  if (base === './') {
    return path.startsWith('/') ? path : `/${path}`;
  }

  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  if (prefix === '' || prefix === '/') {
    return path.startsWith('/') ? path : `/${path}`;
  }
  return `${prefix}/${path}`.replace(/\/+/g, '/');
}
