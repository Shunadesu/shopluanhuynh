import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // null = user chưa chọn, sẽ dùng admin default
      theme: null,

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },

      toggleTheme: () => {
        // Đọc theme hiện tại từ DOM để đảm bảo đồng bộ
        const isDark = document.documentElement.classList.contains('dark');
        const next = isDark ? 'light' : 'dark';
        applyThemeClass(next);
        set({ theme: next });
      },

      // Áp dụng theme mặc định từ admin, chỉ khi user chưa chọn
      applyDefault: (defaultTheme) => {
        const current = get().theme;
        if (!current) {
          applyThemeClass(defaultTheme || 'light');
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
