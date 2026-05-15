import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteLesson, fetchLesson } from '@/shared/api/lessonsApi';
import type { Lesson } from '@/shared/types/models';
import { Card } from '@/shared/ui/Card/Card';
import { Button } from '@/shared/ui/Button/Button';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { MediaImg } from '@/shared/ui/MediaImg/MediaImg';
import { levelLabel } from '@/shared/lib/labels';
import { useAuth } from '@/app/providers/AuthProvider';
import { useFavorites } from '@/app/providers/FavoritesProvider';
import styles from './LessonDetailPage.module.css';

function LessonDetailPageInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLesson(id);
      setLesson(data);
    } catch {
      setError('Занятие не найдено');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = useCallback(async () => {
    if (!lesson || !window.confirm('Удалить занятие?')) return;
    try {
      await deleteLesson(lesson.id);
      navigate('/lessons');
    } catch {
      setError('Не удалось удалить');
    }
  }, [lesson, navigate]);

  const slots = useMemo(() => {
    if (!lesson) return [];
    return lesson.availableSlots.map((s) => new Date(s.startIso).toLocaleString('ru-RU'));
  }, [lesson]);

  if (loading) return <Spinner label="Загружаем карточку…" />;
  if (error || !lesson) return <p className={styles.error}>{error}</p>;

  const lessonFav = isFavorite('lesson', lesson.id);
  const tutorFav = isFavorite('tutor', lesson.tutor.id);

  return (
    <div className={styles.page}>
      <div className={styles.cover}>
        <MediaImg
          src={lesson.coverImageUrl}
          alt=""
          className={styles.cover__img}
          fallbackSrc="placeholders/cover-default.svg"
        />
        <div className={styles.cover__overlay}>
          <p className={styles.badge}>{levelLabel[lesson.level]}</p>
          <h1 className={styles.title}>{lesson.subject}</h1>
          <p className={styles.price}>
            {lesson.priceRub} ₽ · {lesson.durationMinutes} мин · ★ {lesson.rating.toFixed(1)}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Репетитор" className={styles.card}>
          <div className={styles.tutor}>
            <MediaImg
              className={styles.tutor__avatar}
              src={lesson.tutor.avatarUrl}
              alt=""
              fallbackSrc="placeholders/avatar-default.svg"
            />
            <div>
              <p className={styles.tutor__name}>
                {lesson.tutor.firstName} {lesson.tutor.lastName}
              </p>
              <p className={styles.tutor__bio}>{lesson.tutor.bio}</p>
              <div className={styles.favRow}>
                <Button variant={lessonFav ? 'primary' : 'ghost'} onClick={() => toggleFavorite('lesson', lesson.id)}>
                  Занятие {lessonFav ? 'в избранном' : 'в избранное'}
                </Button>
                <Button variant={tutorFav ? 'primary' : 'ghost'} onClick={() => toggleFavorite('tutor', lesson.tutor.id)}>
                  Репетитор {tutorFav ? 'в избранном' : 'в избранное'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Описание" className={styles.card}>
          <p className={styles.text}>{lesson.description}</p>
        </Card>

        <Card title="Доступные слоты" className={styles.card}>
          {slots.length ? (
            <ul className={styles.list}>
              {slots.map((s, i) => (
                <li key={lesson.availableSlots[i]?.id}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Свободных окон пока нет — напишите репетитору.</p>
          )}
        </Card>

        <Card title="Отзывы студентов" className={styles.card}>
          {lesson.reviews.length ? (
            <ul className={styles.reviews}>
              {lesson.reviews.map((r) => (
                <li key={r.id} className={styles.review}>
                  <div className={styles.review__head}>
                    <span className={styles.review__name}>{r.studentName}</span>
                    <span className={styles.review__rating}>★ {r.rating}</span>
                  </div>
                  <p>{r.comment}</p>
                  <p className={styles.muted}>{new Date(r.createdAt).toLocaleDateString('ru-RU')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Отзывов пока нет.</p>
          )}
        </Card>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate('/lessons')}>
          Назад к списку
        </Button>
        {token ? (
          <>
            <Button variant="secondary" onClick={() => navigate(`/lessons/${lesson.id}/edit`)}>
              Редактировать
            </Button>
            <Button variant="ghost" onClick={() => void onDelete()}>
              Удалить
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export const LessonDetailPage = memo(LessonDetailPageInner);
