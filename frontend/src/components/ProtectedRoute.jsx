import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Dispatch custom event to open auth drawer
      window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
