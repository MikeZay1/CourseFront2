import { BaseUiComponent, type BaseUiProps } from '@/shared/ui/BaseUiComponent';
import styles from './Spinner.module.css';

export interface SpinnerProps extends BaseUiProps {
  label?: string;
}

export class Spinner extends BaseUiComponent<SpinnerProps> {
  static displayName = 'Spinner';

  override render() {
    const { label = 'Загрузка…', className } = this.props;
    return (
      <div className={this.mergeClassNames(styles.spinner, className)} role="status" aria-live="polite">
        <span className={styles.spinner__dot} />
        <span className={styles.spinner__label}>{label}</span>
      </div>
    );
  }
}
