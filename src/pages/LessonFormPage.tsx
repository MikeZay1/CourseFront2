import { useCallback, useEffect, useState, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { DifficultyLevel, Lesson } from '@/shared/types/models';
import { createLesson, fetchLesson, updateLesson } from '@/shared/api/lessonsApi';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui/Card/Card';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import styles from './LessonFormPage.module.css';

function buildTutor(first: string, last: string, bio: string, existingId?: string) {
  const id = existingId || `t-${crypto.randomUUID()}`;
  return {
    id,
    firstName: first,
    lastName: last,
    bio,
    avatarUrl: 'placeholders/avatar-default.svg',
  };
}

function LessonFormPageInner() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(lessonId);

  const [loading, setLoading] = useState(isEdit);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2000');
  const [duration, setDuration] = useState('60');
  const [level, setLevel] = useState<DifficultyLevel>('beginner');
  const [tutorFirst, setTutorFirst] = useState('');
  const [tutorLast, setTutorLast] = useState('');
  const [tutorBio, setTutorBio] = useState('');
  const [cover, setCover] = useState('');
  const [tutorId, setTutorId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !lessonId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const lesson = await fetchLesson(lessonId);
        if (cancelled) return;
        setSubject(lesson.subject);
        setDescription(lesson.description);
        setPrice(String(lesson.priceRub));
        setDuration(String(lesson.durationMinutes));
        setLevel(lesson.level);
        setTutorFirst(lesson.tutor.firstName);
        setTutorLast(lesson.tutor.lastName);
        setTutorBio(lesson.tutor.bio || '');
        setCover(lesson.coverImageUrl);
        setTutorId(lesson.tutor.id);
      } catch {
        setError('Не удалось загрузить занятие');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, isEdit]);

  const onSubmit = useCallback(async () => {
    setError(null);
    const priceRub = Number(price);
    const durationMinutes = Number(duration);
    if (!subject.trim() || !description.trim()) {
      setError('Заполните название предмета и описание');
      return;
    }
    if (!tutorFirst.trim() || !tutorLast.trim()) {
      setError('Укажите имя и фамилию репетитора');
      return;
    }
    if (Number.isNaN(priceRub) || Number.isNaN(durationMinutes)) {
      setError('Цена и длительность должны быть числами');
      return;
    }
    const tutor = buildTutor(tutorFirst, tutorLast, tutorBio, tutorId);
    const coverImageUrl = cover.trim() || 'placeholders/cover-default.svg';
    const payload: Omit<Lesson, 'id' | 'createdAt'> = {
      subject: subject.trim(),
      description: description.trim(),
      priceRub,
      durationMinutes,
      level,
      tutor,
      coverImageUrl,
      availableSlots: [],
      reviews: [],
      rating: 5,
    };
    try {
      if (isEdit && lessonId) {
        await updateLesson(lessonId, payload);
        navigate(`/lessons/${lessonId}`);
      } else {
        const created = await createLesson(payload);
        navigate(`/lessons/${created.id}`);
      }
    } catch {
      setError('Ошибка сохранения');
    }
  }, [
    cover,
    description,
    duration,
    isEdit,
    lessonId,
    level,
    navigate,
    price,
    subject,
    tutorBio,
    tutorFirst,
    tutorId,
    tutorLast,
  ]);

  if (loading) return <Spinner label="Загружаем форму…" />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Редактирование занятия' : 'Новое занятие'}</h1>
        <p className={styles.subtitle}>Данные сохраняются в демо-хранилище (localStorage) при мок-API.</p>
      </header>

      <Card title="Основное" className={styles.card}>
        <div className={styles.grid}>
          <Input label="Предмет" value={subject} onChange={setSubject} required />
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Уровень</span>
            <select
              className={styles.select}
              value={level}
              onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
            >
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </label>
          <Input label="Цена, ₽" value={price} onChange={setPrice} />
          <Input label="Длительность, мин" value={duration} onChange={setDuration} />
          <div className={styles.wide}>
            <Input label="Описание" value={description} onChange={setDescription} />
          </div>
          <Input
            label="Обложка (URL, необязательно)"
            value={cover}
            onChange={setCover}
            placeholder="https://..."
          />
        </div>
      </Card>

      <Card title="Репетитор" className={styles.card}>
        <div className={styles.grid}>
          <Input label="Имя" value={tutorFirst} onChange={setTutorFirst} />
          <Input label="Фамилия" value={tutorLast} onChange={setTutorLast} />
          <div className={styles.wide}>
            <Input label="Био" value={tutorBio} onChange={setTutorBio} />
          </div>
        </div>
      </Card>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Отмена
        </Button>
        <Button variant="primary" onClick={() => void onSubmit()}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}

export const LessonFormPage = memo(LessonFormPageInner);
