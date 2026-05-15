import { useCallback, useMemo, useState } from 'react';
import type { LessonFilters } from '@/shared/types/models';

const initial: LessonFilters = {
  search: '',
  subject: '',
  level: '',
  priceMin: '',
  priceMax: '',
  durationMin: '',
  durationMax: '',
};

export function useLessonFilters() {
  const [filters, setFilters] = useState<LessonFilters>(initial);

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }));
  }, []);

  const setSubject = useCallback((subject: string) => {
    setFilters((f) => ({ ...f, subject }));
  }, []);

  const setLevel = useCallback((level: LessonFilters['level']) => {
    setFilters((f) => ({ ...f, level }));
  }, []);

  const setPriceMin = useCallback((priceMin: string) => {
    setFilters((f) => ({ ...f, priceMin }));
  }, []);

  const setPriceMax = useCallback((priceMax: string) => {
    setFilters((f) => ({ ...f, priceMax }));
  }, []);

  const setDurationMin = useCallback((durationMin: string) => {
    setFilters((f) => ({ ...f, durationMin }));
  }, []);

  const setDurationMax = useCallback((durationMax: string) => {
    setFilters((f) => ({ ...f, durationMax }));
  }, []);

  const reset = useCallback(() => setFilters(initial), []);

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (filters.search) p.search = filters.search;
    if (filters.subject) p.subject = filters.subject;
    if (filters.level) p.level = filters.level;
    if (filters.priceMin) p.priceMin = filters.priceMin;
    if (filters.priceMax) p.priceMax = filters.priceMax;
    if (filters.durationMin) p.durationMin = filters.durationMin;
    if (filters.durationMax) p.durationMax = filters.durationMax;
    return p;
  }, [filters]);

  return {
    filters,
    queryParams,
    setSearch,
    setSubject,
    setLevel,
    setPriceMin,
    setPriceMax,
    setDurationMin,
    setDurationMax,
    reset,
  };
}
