import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Use relative path for proxy, or full URL for production build
const baseURL = import.meta.env.DEV ? '/api' : 'https://luanhuynhfc.shop/api';
// Image Base URL - sử dụng proxy trong dev, full URL trong production
const imageBaseURL = import.meta.env.DEV ? '' : 'https://luanhuynhfc.shop';

// Helper function để lấy full image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${imageBaseURL}${path}`;
};

// Export imageBaseURL để sử dụng ở nơi khác
export { imageBaseURL };

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Upload single image với FormData
api.uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/image', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
};

// Upload multiple images với FormData
api.uploadImages = (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  return api.post('/upload/images', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
};

export default api;
