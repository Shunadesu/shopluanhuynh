import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../utils/api';

const TTL = 15 * 60 * 1000; // 15 minutes

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,
      lastFetched: 0,

      isStale: () => {
        const ts = get().lastFetched;
        return !ts || Date.now() - ts > TTL;
      },

      fetchCategories: async (force = false) => {
        const state = get();
        if (!force && state.categories.length > 0 && !state.isStale()) {
          return state.categories;
        }
        set({ loading: true, error: null });
        try {
          const res = await api.get('/categories');
          const data = res.data || [];
          set({
            categories: data,
            lastFetched: Date.now(),
            loading: false,
          });
          return data;
        } catch (err) {
          set({ loading: false, error: err });
          throw err;
        }
      },

      reset: () => set({ categories: [], loading: false, error: null, lastFetched: 0 }),
    }),
    {
      name: 'catalog-storage',
      partialize: (state) => ({
        categories: state.categories,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
