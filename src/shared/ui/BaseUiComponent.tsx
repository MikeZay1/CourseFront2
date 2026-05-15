import { PureComponent, type ErrorInfo, type ReactNode } from 'react';

export interface BaseUiProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

/**
 * Базовый UI-компонент на классе: поверхностное сравнение пропсов (PureComponent),
 * единая точка для логирования ошибок отрисовки и утилит для BEM + CSS Modules.
 */
export abstract class BaseUiComponent<
  P extends BaseUiProps = BaseUiProps,
  S extends object = object,
> extends PureComponent<P, S> {
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[BaseUiComponent]', error, errorInfo);
  }

  protected mergeClassNames(...parts: Array<string | undefined>): string {
    return parts.filter(Boolean).join(' ');
  }
}
