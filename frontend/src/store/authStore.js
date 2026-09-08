import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });

        // Check for buy now account in sessionStorage
        const buyNowAccount = sessionStorage.getItem('buyNowAccount');

        // Merge guest cart with user cart (uses cartStore - shared cache)
        try {
          const guestId = localStorage.getItem('guestId');
          if (guestId) {
            await useCartStore.getState().mergeCart(guestId);
            localStorage.removeItem('guestId');
          }
        } catch (error) {
          console.error('Failed to merge cart:', error);
        }

        // If there was a buy now action, add the account to cart
        if (buyNowAccount) {
          try {
            const account = JSON.parse(buyNowAccount);
            await useCartStore.getState().addToCart(account._id);
            sessionStorage.removeItem('buyNowAccount');
            // Refetch cart to ensure full state sync
            await useCartStore.getState().fetchCart(true);
            window.location.href = '/checkout';
          } catch (error) {
            console.error('Failed to add buy now account:', error);
          }
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        useCartStore.getState().reset();
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
