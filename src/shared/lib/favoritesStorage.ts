import type { FavoriteItem } from '@/shared/types/models';

const KEY = 'tutoring_favorites';

function read(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: FavoriteItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getFavorites(): FavoriteItem[] {
  return read();
}

export function isFavorite(type: FavoriteItem['type'], id: string): boolean {
  return read().some((f) => f.type === type && f.id === id);
}

export function toggleFavorite(type: FavoriteItem['type'], id: string): FavoriteItem[] {
  const items = read();
  const idx = items.findIndex((f) => f.type === type && f.id === id);
  if (idx >= 0) {
    items.splice(idx, 1);
  } else {
    items.push({ type, id });
  }
  write(items);
  return items;
}
