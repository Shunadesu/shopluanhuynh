import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import Settings from './pages/Settings';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
    </QueryClientProvider>
  );
}

export default App;
