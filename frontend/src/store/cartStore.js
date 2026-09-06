import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartCount: 0,
      guestId: null,

      setCartCount: (count) => set({ cartCount: count }),

      incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),

      decrementCart: () => set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),

      clearCart: () => set({ cartCount: 0 }),

      // Fetch cart count from server
      fetchCartCount: async () => {
        try {
          const res = await api.get('/orders/cart');
          const items = res.data?.items || [];
          set({ cartCount: items.length });
          return items;
        } catch (error) {
          // If 401, user not logged in - that's ok for guest cart
          if (error.response?.status === 401) {
            set({ cartCount: 0 });
          }
          return [];
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartCount: state.cartCount }),
    }
  )
);
