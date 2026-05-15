import { renderHook, act } from '@testing-library/react';
import { useLessonFilters } from '@/features/lesson-filters/useLessonFilters';

describe('useLessonFilters', () => {
  it('builds query params from filters', () => {
    const { result } = renderHook(() => useLessonFilters());
    act(() => {
      result.current.setSearch('матем');
      result.current.setSubject('Математика');
      result.current.setLevel('advanced');
      result.current.setPriceMin('1000');
      result.current.setPriceMax('3000');
      result.current.setDurationMin('45');
      result.current.setDurationMax('90');
    });
    expect(result.current.queryParams).toEqual({
      search: 'матем',
      subject: 'Математика',
      level: 'advanced',
      priceMin: '1000',
      priceMax: '3000',
      durationMin: '45',
      durationMax: '90',
    });
  });

  it('resets filters', () => {
    const { result } = renderHook(() => useLessonFilters());
    act(() => {
      result.current.setSearch('test');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.filters.search).toBe('');
    expect(result.current.queryParams).toEqual({});
  });
});
