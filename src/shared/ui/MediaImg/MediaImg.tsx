import { memo, type SyntheticEvent } from 'react';
import { resolveLessonMediaUrl } from '@/shared/lib/mediaUrl';

type Props = {
  src: string | undefined | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  /** Файл из `public/` при ошибке загрузки основного src */
  fallbackSrc?: string;
};

function MediaImgInner({
  src,
  alt,
  className,
  loading = 'lazy',
  fallbackSrc = 'placeholders/cover-default.svg',
}: Props) {
  const primary = resolveLessonMediaUrl(src);
  const fallback = resolveLessonMediaUrl(fallbackSrc);

  const onError = (e: SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.src !== fallback) {
      el.src = fallback;
    }
  };

  return <img src={primary} alt={alt} className={className} loading={loading} onError={onError} />;
}

export const MediaImg = memo(MediaImgInner);
