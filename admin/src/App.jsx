import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import BankAccounts from './pages/BankAccounts';
import Accounts from './pages/Accounts';
import AccountForm from './pages/AccountForm';
import Orders from './pages/Orders';
import Deposits from './pages/Deposits';
import Users from './pages/Users';
import Sliders from './pages/Sliders';
import Notifications from './pages/Notifications';
import NotificationForm from './pages/NotificationForm';
import Settings from './pages/Settings';
import { useAuthStore } from './store/authStore';
import SEOHead from './components/SEOHead';
import api from './utils/api';

function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  // Fetch site settings for SEO and favicon
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: false, // Only fetch when needed, admin panel loads faster
  });

  // Update favicon dynamically from settings
  useEffect(() => {
    if (settings?.favicon) {
      const faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink) {
        faviconLink.href = settings.favicon;
      }
    }
  }, [settings?.favicon]);

  return (
    <>
      <BrowserRouter>
        <SEOHead
          title={settings?.seoTitle}
          description={settings?.seoDescription}
          keywords={settings?.seoKeywords}
          ogImage={settings?.ogImage}
          favicon={settings?.favicon}
          twitterCard={settings?.twitterCard || 'summary'}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/add" element={<CategoryForm />} />
            <Route path="categories/edit/:id" element={<CategoryForm />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="bank-accounts" element={<BankAccounts />} />
            <Route path="accounts/add" element={<AccountForm />} />
            <Route path="accounts/edit/:id" element={<AccountForm />} />
            <Route path="orders" element={<Orders />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="users" element={<Users />} />
            <Route path="sliders" element={<Sliders />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="notifications/add" element={<NotificationForm />} />
            <Route path="notifications/edit/:id" element={<NotificationForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid #1E293B',
            },
            success: {
              iconTheme: {
                primary: '#22D3EE',
                secondary: '#F8FAFC',
              },
            },
            error: {
              iconTheme: {
                primary: '#F97316',
                secondary: '#F8FAFC',
              },
            },
          }}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
