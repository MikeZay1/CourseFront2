import { useEffect, useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/shared/api/lessonsApi';
import type { DashboardPayload } from '@/shared/types/models';
import { Card } from '@/shared/ui/Card/Card';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { MediaImg } from '@/shared/ui/MediaImg/MediaImg';
import { LessonCard } from '@/entities/lesson/LessonCard';
import styles from './HomePage.module.css';

function HomePageInner() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard();
      setData(res);
    } catch {
      setError('Не удалось загрузить дашборд');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Spinner label="Загружаем дашборд…" />;
  }
  if (error || !data) {
    return <p className={styles.muted}>{error}</p>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.hero__title}>Найдите занятие под ваш цель и ритм</h1>
        <p className={styles.hero__text}>
          Фильтры по предмету, уровню, цене и длительности. Сохраняйте репетиторов и уроки в избранное.
        </p>
        <Link className={styles.hero__cta} to="/lessons">
          Смотреть все занятия
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>Недавно добавленные</h2>
        <div className={styles.grid}>
          {data.recentLessons.map((lesson, idx) => (
            <LessonCard key={lesson.id} lesson={lesson} styleIndex={idx} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>Популярные репетиторы</h2>
        <div className={styles.tutors}>
          {data.popularTutors.map((t) => (
            <Card key={t.id} title={`${t.firstName} ${t.lastName}`} className={styles.tutorCard}>
              <div className={styles.tutorRow}>
                <MediaImg
                  className={styles.tutorAvatar}
                  src={t.avatarUrl}
                  alt=""
                  fallbackSrc="placeholders/avatar-default.svg"
                />
                <p className={styles.tutorBio}>{t.bio || 'Опытный преподаватель с высоким рейтингом.'}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export const HomePage = memo(HomePageInner);
