import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartCount: 0,

      setCartCount: (count) => set({ cartCount: count }),

      incrementCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),

      decrementCart: () => set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),

      clearCart: () => set({ cartCount: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
