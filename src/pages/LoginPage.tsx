import { FormEvent, useState, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui/Card/Card';
import { useAuth } from '@/app/providers/AuthProvider';
import styles from './AuthPages.module.css';

function LoginPageInner() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          'Неверные данные или пользователь не найден. Сначала зарегистрируйтесь.',
        ),
      );
    }
  };

  return (
    <div className={styles.page}>
      <Card title="Вход" className={styles.card}>
        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </Button>
        </form>
        <p className={styles.hint}>
          Нет аккаунта? <Link to="/register">Регистрация</Link>
        </p>
      </Card>
    </div>
  );
}

export const LoginPage = memo(LoginPageInner);
