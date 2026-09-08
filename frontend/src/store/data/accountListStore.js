import { create } from 'zustand';
import api from '../../utils/api';

const TTL = 60 * 1000; // 60 seconds

const paramsKey = (params) => {
  if (!params) return 'default';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
};

export const useAccountListStore = create((set, get) => ({
  // byFilter: { [key]: { data, accounts, pagination, ts } }
  byFilter: {},
  loading: {}, // { [key]: bool }
  error: null,

  isStale: (key) => {
    const entry = get().byFilter[key];
    return !entry || Date.now() - entry.ts > TTL;
  },

  fetchAccounts: async (params = {}, force = false) => {
    const key = paramsKey(params);
    const state = get();
    const existing = state.byFilter[key];
    if (!force && existing && !state.isStale(key)) {
      return existing;
    }

    set((s) => ({ loading: { ...s.loading, [key]: true }, error: null }));
    try {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          queryString.append(k, v);
        }
      });
      const url = `/accounts${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const res = await api.get(url);
      const data = res.data || {};
      const payload = {
        data,
        accounts: data.accounts || [],
        pagination: data.pagination || null,
        ts: Date.now(),
      };
      set((s) => ({
        byFilter: { ...s.byFilter, [key]: payload },
        loading: { ...s.loading, [key]: false },
      }));
      return payload;
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, [key]: false }, error: err }));
      throw err;
    }
  },

  invalidate: () => set({ byFilter: {}, loading: {} }),

  reset: () => set({ byFilter: {}, loading: {}, error: null }),
}));

export const accountListParamsKey = paramsKey;
