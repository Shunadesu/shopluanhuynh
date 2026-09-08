import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import AppSplash from './components/AppSplash.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useThemeStore } from './store/themeStore';

// Subscribe theme store changes to re-render this component (Toaster)
// This lets toast colors update when user toggles theme.
function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme =
    theme ??
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light');

  const isDark = resolvedTheme === 'dark';

  return (
    <Toaster
      key={resolvedTheme}
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#0F172A',
          border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        },
        success: {
          iconTheme: {
            primary: '#D84315',
            secondary: isDark ? '#F8FAFC' : '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: isDark ? '#F8FAFC' : '#FFFFFF',
          },
        },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <AppSplash />
          <ThemedToaster />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
