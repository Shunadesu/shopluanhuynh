import { create } from 'zustand';
import api from '../../utils/api';

const TTL = 2 * 60 * 1000; // 2 minutes
const MAX_ENTRIES = 30;

const prune = (byId) => {
  const keys = Object.keys(byId);
  if (keys.length <= MAX_ENTRIES) return byId;
  // sort oldest first by ts
  const sorted = keys.sort((a, b) => byId[a].ts - byId[b].ts);
  const toDrop = sorted.slice(0, keys.length - MAX_ENTRIES);
  const next = { ...byId };
  toDrop.forEach((k) => delete next[k]);
  return next;
};

export const useAccountDetailStore = create((set, get) => ({
  byId: {}, // { [id]: { account, ts } }
  loading: {}, // { [id]: bool }
  error: null,

  isStale: (id) => {
    const entry = get().byId[id];
    return !entry || Date.now() - entry.ts > TTL;
  },

  fetchAccount: async (id, force = false) => {
    if (!id) return null;
    const state = get();
    const existing = state.byId[id];
    if (!force && existing && !state.isStale(id)) {
      return existing.account;
    }
    set((s) => ({ loading: { ...s.loading, [id]: true }, error: null }));
    try {
      const res = await api.get(`/accounts/${id}`);
      const account = res.data;
      set((s) => {
        const nextById = prune({
          ...s.byId,
          [id]: { account, ts: Date.now() },
        });
        return {
          byId: nextById,
          loading: { ...s.loading, [id]: false },
        };
      });
      return account;
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, [id]: false }, error: err }));
      throw err;
    }
  },

  invalidate: (id) => {
    if (!id) {
      set({ byId: {}, loading: {} });
      return;
    }
    set((s) => {
      const next = { ...s.byId };
      delete next[id];
      return { byId: next, loading: { ...s.loading, [id]: false } };
    });
  },

  reset: () => set({ byId: {}, loading: {}, error: null }),
}));
