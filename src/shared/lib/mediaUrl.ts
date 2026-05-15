/**
 * Обложки и аватары из `public/placeholders/` (без внешних CDN).
 * Относительные пути дополняются `import.meta.env.BASE_URL` для GitHub Pages.
 */
export function resolveLessonMediaUrl(url: string | undefined | null): string {
  if (!url || !url.trim()) {
    return joinBase('placeholders/cover-default.svg');
  }
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) {
    return u;
  }
  return joinBase(u.replace(/^\//, ''));
}

function joinBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${path}`;
}
