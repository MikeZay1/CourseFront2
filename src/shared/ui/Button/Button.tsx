import { BaseUiComponent, type BaseUiProps } from '@/shared/ui/BaseUiComponent';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends BaseUiProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
}

export class Button extends BaseUiComponent<ButtonProps> {
  static displayName = 'Button';

  override render() {
    const { children, className, variant = 'primary', type = 'button', disabled, onClick, ...rest } =
      this.props;
    const root = this.mergeClassNames(
      styles.button,
      styles[`button_variant_${variant}`],
      className,
    );
    return (
      <button
        type={type}
        className={root}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }
}
