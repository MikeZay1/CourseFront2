import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FavoriteItem } from '@/shared/types/models';
import {
  getFavorites,
  isFavorite as isFav,
  toggleFavorite as toggleFav,
} from '@/shared/lib/favoritesStorage';

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  toggleFavorite: (type: FavoriteItem['type'], id: string) => void;
  isFavorite: (type: FavoriteItem['type'], id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites());

  const toggleFavorite = useCallback((type: FavoriteItem['type'], id: string) => {
    const next = toggleFav(type, id);
    setFavorites(next);
  }, []);

  const isFavorite = useCallback((type: FavoriteItem['type'], id: string) => isFav(type, id), []);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite }),
    [favorites, toggleFavorite, isFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
