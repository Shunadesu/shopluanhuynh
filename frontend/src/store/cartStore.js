import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Guest cart keys
const GUEST_CART_KEY = 'guest_cart';

/**
 * Guest cart helpers (localStorage)
 */
const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const setGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const addToGuestCart = (account) => {
  const items = getGuestCart();
  // Check if already in cart
  if (items.some((i) => i._id === account._id)) {
    return { items, added: false, message: 'Sản phẩm đã có trong giỏ hàng' };
  }
  const newItems = [...items, {
    _id: account._id,
    title: account.title,
    price: account.price,
    images: account.images || [],
    rank: account.rank || null,
    server: account.server || null,
    addedAt: Date.now(),
  }];
  setGuestCart(newItems);
  return { items: newItems, added: true };
};

const removeFromGuestCart = (accountId) => {
  const items = getGuestCart().filter((i) => i._id !== accountId);
  setGuestCart(items);
  return { items };
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  return { items: [] };
};

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

      isGuestCart: () => !localStorage.getItem('token'),

      fetchCart: async (force = false) => {
        const token = localStorage.getItem('token');

        // Guest: load from localStorage
        if (!token) {
          const items = getGuestCart();
          set({
            cartData: { items },
            cartCount: items.length,
            loading: false,
          });
          return { items };
        }

        // Authenticated: fetch from API
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

      /**
       * Add to cart — works for both guest and authenticated users.
       * If account object is passed, it's a guest add (local only).
       * If accountId string is passed, it's an API call (authenticated).
       */
      addToCart: async (accountIdOrObject) => {
        const token = localStorage.getItem('token');

        // Guest mode: store locally
        if (!token) {
          const account = accountIdOrObject;
          if (!account._id) {
            throw new Error('Invalid account data');
          }
          const { items, added, message } = addToGuestCart(account);
          set({
            cartData: { items },
            cartCount: items.length,
            mutating: false,
          });
          return { items, added, message };
        }

        // Authenticated: call API
        set({ mutating: true, error: null });
        try {
          const res = await api.post('/orders/cart', { accountId: accountIdOrObject });
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
        const token = localStorage.getItem('token');

        // Guest mode: store locally
        if (!token) {
          const account = accountId; // Assume it's already an account object for add flow
          const { items, added, message } = addToGuestCart(account);
          set({
            cartData: { items },
            cartCount: items.length,
            mutating: false,
          });
          return { items, added, message };
        }

        // Authenticated
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
        const token = localStorage.getItem('token');

        // Guest mode: remove from localStorage
        if (!token) {
          const { items } = removeFromGuestCart(accountId);
          set({
            cartData: { items },
            cartCount: items.length,
            mutating: false,
          });
          return { items };
        }

        // Authenticated: call API
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

      clearGuestCart: () => {
        clearGuestCart();
        set({ cartCount: 0, cartData: { items: [] } });
      },

      checkout: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Vui lòng đăng nhập để thanh toán');
        }

        set({ mutating: true, error: null });
        try {
          const res = await api.post('/orders/checkout');
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

      mergeCart: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const guestItems = getGuestCart();
        if (guestItems.length === 0) return null;

        try {
          // Call API to merge guest cart with user cart
          const res = await api.post('/orders/cart/merge', {
            items: guestItems,
          });
          const items = res.data?.items || [];
          set({
            cartData: res.data || { items },
            cartCount: items.length,
            lastFetched: Date.now(),
          });
          // Clear guest cart after successful merge
          clearGuestCart();
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
