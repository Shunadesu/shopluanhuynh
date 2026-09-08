import { create } from 'zustand';
import api from '../../utils/api';

const TTL = 60 * 1000; // 60 seconds

export const useUserStore = create((set, get) => ({
  profile: null,
  lastFetched: 0,
  loading: false,
  error: null,

  isStale: () => {
    const ts = get().lastFetched;
    return !ts || Date.now() - ts > TTL;
  },

  fetchProfile: async (force = false) => {
    const state = get();
    if (!force && state.profile && !state.isStale()) {
      return state.profile;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      const profile = res.data;
      set({ profile, lastFetched: Date.now(), loading: false });
      return profile;
    } catch (err) {
      set({ loading: false, error: err });
      throw err;
    }
  },

  setProfile: (profile) => set({ profile, lastFetched: Date.now() }),

  reset: () => set({ profile: null, lastFetched: 0, loading: false, error: null }),
}));
