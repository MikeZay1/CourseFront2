import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { FavoritesProvider } from '@/app/providers/FavoritesProvider';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
);
