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

  // Fetch tất cả accounts qua nhiều trang (dùng cho Home để hiển thị vô hạn).
  // Bỏ qua `page`/`limit` trong params, tự động loop cho đến khi hết.
  fetchAllAccounts: async (params = {}, force = false) => {
    const key = `all:${paramsKey(params)}`;
    const state = get();
    const existing = state.byFilter[key];
    if (!force && existing && existing.allLoaded && !state.isStale(key)) {
      return existing;
    }

    set((s) => ({ loading: { ...s.loading, [key]: true }, error: null }));
    try {
      const PAGE_SIZE = 100;
      const filterParams = { ...params };
      delete filterParams.page;
      delete filterParams.limit;
      delete filterParams.fetchAll;

      const buildUrl = (page) => {
        const qs = new URLSearchParams();
        Object.entries({ ...filterParams, page, limit: PAGE_SIZE }).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) qs.append(k, v);
        });
        return `/accounts?${qs.toString()}`;
      };

      const firstRes = await api.get(buildUrl(1));
      const firstData = firstRes.data || {};
      const total = firstData.pagination?.total || 0;
      const totalPages = firstData.pagination?.pages || 1;

      let allAccounts = [...(firstData.accounts || [])];

      if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const results = await Promise.all(
          remainingPages.map((page) =>
            api.get(buildUrl(page)).then((res) => res.data?.accounts || [])
          )
        );
        allAccounts = allAccounts.concat(...results);
      }

      const payload = {
        data: { accounts: allAccounts },
        accounts: allAccounts,
        pagination: { page: 1, limit: allAccounts.length, total, pages: 1 },
        ts: Date.now(),
        allLoaded: true,
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
