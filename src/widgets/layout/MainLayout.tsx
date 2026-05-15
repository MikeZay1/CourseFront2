import { Link, NavLink, Outlet } from 'react-router-dom';
import { memo, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui/Button/Button';
import styles from './MainLayout.module.css';

function MainLayoutInner() {
  const { user, logout } = useAuth();
  const onLogout = useCallback(() => logout(), [logout]);

  return (
    <div className={styles.layout}>
      <header className={styles.layout__header}>
        <div className={styles.layout__brand}>
          <Link to="/" className={styles.layout__logo}>
            TutorSpace
          </Link>
          <span className={styles.layout__tagline}>Запись на занятия</span>
        </div>
        <nav className={styles.layout__nav} aria-label="Основная навигация">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [styles.layout__link, isActive ? styles.layout__link_active : ''].join(' ')
            }
            end
          >
            Дашборд
          </NavLink>
          <NavLink
            to="/lessons"
            className={({ isActive }) =>
              [styles.layout__link, isActive ? styles.layout__link_active : ''].join(' ')
            }
          >
            Занятия
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              [styles.layout__link, isActive ? styles.layout__link_active : ''].join(' ')
            }
          >
            Избранное
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/lessons/new"
                className={({ isActive }) =>
                  [styles.layout__link, isActive ? styles.layout__link_active : ''].join(' ')
                }
              >
                Создать
              </NavLink>
              <span className={styles.layout__user}>
                {user.firstName} {user.lastName}
              </span>
              <Button variant="ghost" onClick={onLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link className={styles.layout__authLink} to="/login">
                Вход
              </Link>
              <Link className={styles.layout__authPrimary} to="/register">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.layout__main}>
        <Outlet />
      </main>
      <footer className={styles.layout__footer}>Демо-клиент с мок-API и JWT в localStorage.</footer>
    </div>
  );
}

export const MainLayout = memo(MainLayoutInner);
