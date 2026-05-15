import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/widgets/layout/MainLayout';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { Spinner } from '@/shared/ui/Spinner/Spinner';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LessonsPage = lazy(() => import('@/pages/LessonsPage').then((m) => ({ default: m.LessonsPage })));
const LessonDetailPage = lazy(() =>
  import('@/pages/LessonDetailPage').then((m) => ({ default: m.LessonDetailPage })),
);
const LessonFormPage = lazy(() =>
  import('@/pages/LessonFormPage').then((m) => ({ default: m.LessonFormPage })),
);
const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'lessons', element: <LessonsPage /> },
      { path: 'lessons/new', element: <ProtectedRoute><LessonFormPage /></ProtectedRoute> },
      {
        path: 'lessons/:lessonId/edit',
        element: (
          <ProtectedRoute>
            <LessonFormPage />
          </ProtectedRoute>
        ),
      },
      { path: 'lessons/:id', element: <LessonDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

/**
 * React Router: basename только с ведущим слэшем, без завершающего.
 * На GitHub Actions ассеты собираются с base './', путь к репо задаём через VITE_ROUTER_BASENAME.
 */
function resolveRouterBasename(): string | undefined {
  const explicit = import.meta.env.VITE_ROUTER_BASENAME?.trim();
  if (explicit) {
    const noTrail = explicit.replace(/\/+$/, '');
    return noTrail === '' ? undefined : noTrail;
  }
  const base = import.meta.env.BASE_URL || '/';
  if (base === '/' || base === './' || base.startsWith('./')) return undefined;
  const trimmed = base.replace(/\/+$/, '');
  return trimmed === '' ? undefined : trimmed;
}

const router = createBrowserRouter(routes, { basename: resolveRouterBasename() });

export function App() {
  return (
    <Suspense fallback={<Spinner label="Загружаем страницу…" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
