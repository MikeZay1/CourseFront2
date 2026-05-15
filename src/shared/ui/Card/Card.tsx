import { BaseUiComponent, type BaseUiProps } from '@/shared/ui/BaseUiComponent';
import styles from './Card.module.css';

export interface CardProps extends BaseUiProps {
  title?: string;
  padded?: boolean;
}

export class Card extends BaseUiComponent<CardProps> {
  static override displayName = 'Card';

  override render() {
    const { title, children, className, padded = true } = this.props;
    const root = this.mergeClassNames(styles.card, padded && styles.card_padded, className);
    return (
      <section className={root}>
        {title ? <header className={styles.card__header}>{title}</header> : null}
        <div className={styles.card__body}>{children}</div>
      </section>
    );
  }
}
