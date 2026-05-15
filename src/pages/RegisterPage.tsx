import { FormEvent, useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui/Card/Card';
import { useAuth } from '@/app/providers/AuthProvider';
import styles from './AuthPages.module.css';

function RegisterPageInner() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ firstName, lastName, email, password });
      navigate('/');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось создать аккаунт. Возможно, email уже занят.'));
    }
  };

  return (
    <div className={styles.page}>
      <Card title="Регистрация" className={styles.card}>
        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <Input label="Имя" value={firstName} onChange={setFirstName} required />
          <Input label="Фамилия" value={lastName} onChange={setLastName} required />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Пароль" type="password" value={password} onChange={setPassword} required />
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Создаём…' : 'Создать аккаунт'}
          </Button>
        </form>
        <p className={styles.hint}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </Card>
    </div>
  );
}

export const RegisterPage = memo(RegisterPageInner);
