import { Link } from 'react-router-dom';
import { memo, useCallback } from 'react';
import { BaseUiComponent, type BaseUiProps } from '@/shared/ui/BaseUiComponent';
import { levelLabel } from '@/shared/lib/labels';
import type { Lesson } from '@/shared/types/models';
import { useFavorites } from '@/app/providers/FavoritesProvider';
import styles from './LessonCard.module.css';

export interface LessonCardProps extends BaseUiProps {
  lesson: Lesson;
  styleIndex?: number;
}

class LessonCardView extends BaseUiComponent<LessonCardProps> {
  static override displayName = 'LessonCardView';

  override render() {
    const { lesson, className, styleIndex = 0 } = this.props;
    const delay = `${Math.min(styleIndex, 8) * 45}ms`;
    return (
      <article
        className={this.mergeClassNames(styles.lessonCard, className)}
        style={{ animationDelay: delay }}
      >
        <div className={styles.lessonCard__body}>
          <Link to={`/lessons/${lesson.id}`} className={styles.lessonCard__lead}>
            <p className={styles.lessonCard__subject}>{lesson.subject}</p>
            <p className={styles.lessonCard__level}>Уровень: {levelLabel[lesson.level]}</p>
          </Link>
          <header className={styles.lessonCard__header}>
            <p className={styles.lessonCard__tutor}>
              {lesson.tutor.firstName} {lesson.tutor.lastName}
            </p>
            <FavoriteToggle lessonId={lesson.id} tutorId={lesson.tutor.id} />
          </header>
          <p className={styles.lessonCard__desc}>{lesson.description}</p>
          <footer className={styles.lessonCard__footer}>
            <div>
              <span className={styles.lessonCard__price}>{lesson.priceRub} ₽</span>
              <span className={styles.lessonCard__meta}> / {lesson.durationMinutes} мин</span>
            </div>
            <div className={styles.lessonCard__rating}>★ {lesson.rating.toFixed(1)}</div>
          </footer>
          <div className={styles.lessonCard__cta}>
            <Link className={styles.lessonCard__linkBtn} to={`/lessons/${lesson.id}`}>
              Подробнее
            </Link>
          </div>
        </div>
      </article>
    );
  }
}

function FavoriteToggleInner({ lessonId, tutorId }: { lessonId: string; tutorId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const lessonFav = isFavorite('lesson', lessonId);
  const tutorFav = isFavorite('tutor', tutorId);
  const onLesson = useCallback(() => toggleFavorite('lesson', lessonId), [lessonId, toggleFavorite]);
  const onTutor = useCallback(() => toggleFavorite('tutor', tutorId), [tutorId, toggleFavorite]);
  return (
    <div className={styles.lessonCard__fav}>
      <button
        type="button"
        className={styles.lessonCard__favBtn}
        aria-pressed={lessonFav}
        onClick={onLesson}
        title="В избранное: занятие"
      >
        📘{lessonFav ? ' ✓' : ''}
      </button>
      <button
        type="button"
        className={styles.lessonCard__favBtn}
        aria-pressed={tutorFav}
        onClick={onTutor}
        title="В избранное: репетитор"
      >
        👤{tutorFav ? ' ✓' : ''}
      </button>
    </div>
  );
}

const FavoriteToggle = memo(FavoriteToggleInner);

export const LessonCard = memo(LessonCardView);
