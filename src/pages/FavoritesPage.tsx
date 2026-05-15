import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { fetchLessons } from '@/shared/api/lessonsApi';
import type { Lesson } from '@/shared/types/models';
import { useFavorites } from '@/app/providers/FavoritesProvider';
import { Card } from '@/shared/ui/Card/Card';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { LessonCard } from '@/entities/lesson/LessonCard';
import { MediaImg } from '@/shared/ui/MediaImg/MediaImg';
import styles from './FavoritesPage.module.css';

function FavoritesPageInner() {
  const { favorites } = useFavorites();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLessons({});
      setLessons(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const favLessons = useMemo(
    () => lessons.filter((l) => favorites.some((f) => f.type === 'lesson' && f.id === l.id)),
    [favorites, lessons],
  );

  const favTutors = useMemo(() => {
    const tutorIds = new Set(
      favorites.filter((f) => f.type === 'tutor').map((f) => f.id),
    );
    const map = new Map<string, Lesson>();
    lessons.forEach((l) => {
      if (tutorIds.has(l.tutor.id)) map.set(l.tutor.id, l);
    });
    return [...map.values()];
  }, [favorites, lessons]);

  if (loading) return <Spinner label="Загружаем избранное…" />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Избранное</h1>
        <p className={styles.subtitle}>Сохранённые занятия и репетиторы доступны офлайн в этом браузере.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Занятия</h2>
        {favLessons.length ? (
          <div className={styles.grid}>
            {favLessons.map((lesson, idx) => (
              <LessonCard key={lesson.id} lesson={lesson} styleIndex={idx} />
            ))}
          </div>
        ) : (
          <Card title="Пока пусто">
            <p className={styles.muted}>Добавьте карточки занятий с помощью кнопок на каталоге.</p>
            <Link className={styles.link} to="/lessons">
              Перейти в каталог
            </Link>
          </Card>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Репетиторы</h2>
        {favTutors.length ? (
          <div className={styles.tutors}>
            {favTutors.map((lesson) => (
              <Card
                key={lesson.tutor.id}
                title={`${lesson.tutor.firstName} ${lesson.tutor.lastName}`}
                className={styles.tutorCard}
              >
                <div className={styles.tutorRow}>
                  <MediaImg
                    className={styles.avatar}
                    src={lesson.tutor.avatarUrl}
                    alt=""
                    fallbackSrc="placeholders/avatar-default.svg"
                  />
                  <div>
                    <p className={styles.muted}>{lesson.tutor.bio}</p>
                    <Link className={styles.link} to={`/lessons/${lesson.id}`}>
                      Открыть занятие
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className={styles.muted}>Репетиторы из избранного появятся здесь.</p>
        )}
      </section>
    </div>
  );
}

export const FavoritesPage = memo(FavoritesPageInner);
