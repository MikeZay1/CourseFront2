import { BaseUiComponent, type BaseUiProps } from '@/shared/ui/BaseUiComponent';
import styles from './Input.module.css';

export interface InputProps extends BaseUiProps {
  id?: string;
  label?: string;
  type?: string;
  value: string;
  placeholder?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export class Input extends BaseUiComponent<InputProps> {
  static displayName = 'Input';

  override render() {
    const {
      id,
      label,
      type = 'text',
      value,
      placeholder,
      name,
      autoComplete,
      required,
      disabled,
      onChange,
      className,
    } = this.props;
    const fieldClass = this.mergeClassNames(styles.input__field, className);
    return (
      <label className={styles.input} htmlFor={id}>
        {label ? <span className={styles.input__label}>{label}</span> : null}
        <input
          id={id}
          className={fieldClass}
          type={type}
          value={value}
          placeholder={placeholder}
          name={name}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
}
