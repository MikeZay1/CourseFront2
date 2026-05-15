import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { fetchLessons } from '@/shared/api/lessonsApi';
import { SEED_LESSONS, subjectsCatalog } from '@/shared/api/mockEngine';
import type { Lesson } from '@/shared/types/models';
import { useLessonFilters } from '@/features/lesson-filters/useLessonFilters';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { LessonCard } from '@/entities/lesson/LessonCard';
import { levelLabel } from '@/shared/lib/labels';
import styles from './LessonsPage.module.css';

function LessonsPageInner() {
  const {
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
  } = useLessonFilters();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subjects = useMemo(() => {
    const byId = new Map<string, Lesson>();
    SEED_LESSONS.forEach((l) => byId.set(l.id, l));
    lessons.forEach((l) => byId.set(l.id, l));
    return subjectsCatalog([...byId.values()]);
  }, [lessons]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLessons(queryParams);
      setLessons(data);
    } catch {
      setError('Ошибка загрузки списка');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Каталог занятий</h1>
        <p className={styles.subtitle}>Поиск по предмету или имени репетитора, точные фильтры по параметрам.</p>
      </header>

      <section className={styles.filters} aria-label="Фильтры">
        <Input label="Поиск" value={filters.search} onChange={setSearch} placeholder="Математика или Анна" />
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Предмет</span>
          <select
            className={styles.select}
            value={filters.subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Все</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Уровень</span>
          <select
            className={styles.select}
            value={filters.level}
            onChange={(e) => setLevel(e.target.value as typeof filters.level)}
          >
            <option value="">Любой</option>
            <option value="beginner">{levelLabel.beginner}</option>
            <option value="intermediate">{levelLabel.intermediate}</option>
            <option value="advanced">{levelLabel.advanced}</option>
          </select>
        </label>
        <Input label="Цена от, ₽" value={filters.priceMin} onChange={setPriceMin} placeholder="1500" />
        <Input label="Цена до, ₽" value={filters.priceMax} onChange={setPriceMax} placeholder="4000" />
        <Input label="Длительность от, мин" value={filters.durationMin} onChange={setDurationMin} />
        <Input label="Длительность до, мин" value={filters.durationMax} onChange={setDurationMax} />
        <div className={styles.actions}>
          <Button variant="ghost" onClick={reset}>
            Сбросить
          </Button>
          <Button variant="primary" onClick={() => void reload()}>
            Обновить
          </Button>
        </div>
      </section>

      {loading ? <Spinner /> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error ? (
        <div className={styles.grid}>
          {lessons.map((lesson, idx) => (
            <LessonCard key={lesson.id} lesson={lesson} styleIndex={idx} />
          ))}
        </div>
      ) : null}

      {!loading && !lessons.length ? <p className={styles.empty}>Ничего не найдено — измените фильтры.</p> : null}
    </div>
  );
}

export const LessonsPage = memo(LessonsPageInner);
