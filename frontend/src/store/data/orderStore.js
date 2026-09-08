import { create } from 'zustand';
import api from '../../utils/api';

const TTL = 60 * 1000; // 60 seconds
const MAX_ID_ENTRIES = 30;

const prune = (byId) => {
  const keys = Object.keys(byId);
  if (keys.length <= MAX_ID_ENTRIES) return byId;
  const sorted = keys.sort((a, b) => byId[a].ts - byId[b].ts);
  const next = { ...byId };
  sorted.slice(0, keys.length - MAX_ID_ENTRIES).forEach((k) => delete next[k]);
  return next;
};

export const useOrderStore = create((set, get) => ({
  orders: [],
  lastFetchedOrders: 0,
  ordersLoading: false,
  orderById: {}, // { [id]: { order, ts } }
  orderLoading: {}, // { [id]: bool }
  purchasedAccounts: [],
  lastFetchedPurchased: 0,
  purchasedLoading: false,
  error: null,

  fetchOrders: async (force = false) => {
    const state = get();
    if (!force && state.orders.length > 0 && Date.now() - state.lastFetchedOrders < TTL) {
      return state.orders;
    }
    set({ ordersLoading: true, error: null });
    try {
      const res = await api.get('/orders');
      const orders = res.data || [];
      set({
        orders,
        lastFetchedOrders: Date.now(),
        ordersLoading: false,
      });
      return orders;
    } catch (err) {
      set({ ordersLoading: false, error: err });
      throw err;
    }
  },

  fetchOrderDetail: async (id, force = false) => {
    if (!id) return null;
    const state = get();
    const existing = state.orderById[id];
    if (!force && existing && Date.now() - existing.ts < TTL) {
      return existing.order;
    }
    set((s) => ({ orderLoading: { ...s.orderLoading, [id]: true }, error: null }));
    try {
      const res = await api.get(`/orders/${id}`);
      const order = res.data;
      set((s) => ({
        orderById: prune({
          ...s.orderById,
          [id]: { order, ts: Date.now() },
        }),
        orderLoading: { ...s.orderLoading, [id]: false },
      }));
      return order;
    } catch (err) {
      set((s) => ({ orderLoading: { ...s.orderLoading, [id]: false }, error: err }));
      throw err;
    }
  },

  fetchPurchasedAccounts: async (force = false) => {
    const state = get();
    if (!force && state.purchasedAccounts.length > 0 && Date.now() - state.lastFetchedPurchased < TTL) {
      return state.purchasedAccounts;
    }
    set({ purchasedLoading: true, error: null });
    try {
      const res = await api.get('/orders/purchased-accounts');
      const data = res.data || [];
      set({
        purchasedAccounts: data,
        lastFetchedPurchased: Date.now(),
        purchasedLoading: false,
      });
      return data;
    } catch (err) {
      set({ purchasedLoading: false, error: err });
      throw err;
    }
  },

  invalidateOrders: () => set({
    orders: [],
    lastFetchedOrders: 0,
    orderById: {},
    purchasedAccounts: [],
    lastFetchedPurchased: 0,
  }),

  reset: () => set({
    orders: [],
    lastFetchedOrders: 0,
    ordersLoading: false,
    orderById: {},
    orderLoading: {},
    purchasedAccounts: [],
    lastFetchedPurchased: 0,
    purchasedLoading: false,
    error: null,
  }),
}));
