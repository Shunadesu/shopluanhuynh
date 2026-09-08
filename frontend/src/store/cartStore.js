import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartCount: 0,
      cartData: null,
      loading: false,
      lastFetched: 0,
      mutating: false,
      error: null,

      setCartCount: (count) => set({ cartCount: count }),

      incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),

      decrementCart: () => set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),

      clearCart: () => set({ cartCount: 0, cartData: null, lastFetched: 0 }),

      fetchCart: async (force = false) => {
        // Always allow fetch; do not block. Cart is user-specific, in-memory only.
        if (get().loading) return get().cartData;
        set({ loading: true, error: null });
        try {
          const res = await api.get('/orders/cart');
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
            loading: false,
          });
          return res.data;
        } catch (error) {
          if (error?.__skipped || error.response?.status === 401) {
            set({ cartCount: 0, cartData: { items: [] }, loading: false });
            return { items: [] };
          }
          set({ loading: false, error });
          return get().cartData || { items: [] };
        }
      },

      addToCart: async (accountId) => {
        set({ mutating: true, error: null });
        try {
          const res = await api.post('/orders/cart', { accountId });
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
            mutating: false,
          });
          return res.data;
        } catch (err) {
          if (err?.__skipped) {
            set({ mutating: false });
            return { items: [], skipped: true };
          }
          set({ mutating: false, error: err });
          throw err;
        }
      },

      addToCartAdd: async (accountId) => {
        set({ mutating: true, error: null });
        try {
          const res = await api.post('/orders/cart/add', { accountId });
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
            mutating: false,
          });
          return res.data;
        } catch (err) {
          if (err?.__skipped) {
            set({ mutating: false });
            return { items: [], skipped: true };
          }
          set({ mutating: false, error: err });
          throw err;
        }
      },

      removeFromCart: async (accountId) => {
        set({ mutating: true, error: null });
        try {
          const res = await api.delete(`/orders/cart/${accountId}`);
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
            mutating: false,
          });
          return res.data;
        } catch (err) {
          if (err?.__skipped) {
            set({ mutating: false });
            return { items: [], skipped: true };
          }
          set({ mutating: false, error: err });
          throw err;
        }
      },

      checkout: async () => {
        set({ mutating: true, error: null });
        try {
          const res = await api.post('/orders/checkout');
          // Cart is emptied after checkout
          set({
            cartData: { items: [] },
            cartCount: 0,
            lastFetched: Date.now(),
            mutating: false,
          });
          return res.data;
        } catch (err) {
          if (err?.__skipped) {
            set({ mutating: false });
            return { skipped: true };
          }
          set({ mutating: false, error: err });
          throw err;
        }
      },

      mergeCart: async (guestId) => {
        try {
          const res = await api.post('/orders/cart/merge', { guestId });
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
          });
          return res.data;
        } catch (err) {
          // non-fatal
          return null;
        }
      },

      reset: () => set({
        cartCount: 0,
        cartData: null,
        loading: false,
        lastFetched: 0,
        mutating: false,
        error: null,
      }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartCount: state.cartCount }),
    }
  )
);
