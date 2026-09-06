import axios from 'axios';

// Use relative path for proxy in dev, or full URL for production
const isDev = import.meta.env.DEV;
const baseURL = isDev ? '/api' : 'https://luanhuynhfc.shop/api';
// Image Base URL - sử dụng proxy trong dev, full URL trong production
const imageBaseURL = isDev ? '' : 'https://luanhuynhfc.shop';

// Helper function để lấy full image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${imageBaseURL}${path}`;
};

// Export imageBaseURL để sử dụng ở nơi khác
export { imageBaseURL };

// Generate guest ID if not exists
const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token and guest ID to requests
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add guest ID for cart operations
    if (config.url?.includes('/cart')) {
      const guestId = getGuestId();
      config.headers['X-Guest-Id'] = guestId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect to /login anymore, just clear
    }
    return Promise.reject(error);
  }
);

// Export guest ID getter for use in cart operations
export { getGuestId };
export default api;
