import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { getGuestId } from '../utils/api';
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
        
        // Merge guest cart with user cart
        try {
          const guestId = localStorage.getItem('guestId');
          if (guestId) {
            const res = await api.post('/orders/cart/merge', { guestId });
            const { setCartCount } = useCartStore.getState();
            setCartCount(res.data.items?.length || 0);
            
            // Clear guest ID after merge
            localStorage.removeItem('guestId');
          }
        } catch (error) {
          console.error('Failed to merge cart:', error);
        }

        // If there was a buy now action, add the account to cart
        if (buyNowAccount) {
          try {
            const account = JSON.parse(buyNowAccount);
            await api.post('/orders/cart', { accountId: account._id });
            sessionStorage.removeItem('buyNowAccount');
            // Refresh cart count
            const { setCartCount } = useCartStore.getState();
            const cartRes = await api.get('/orders/cart');
            setCartCount(cartRes.data?.items?.length || 0);
            // Navigate to checkout
            window.location.href = '/checkout';
          } catch (error) {
            console.error('Failed to add buy now account:', error);
          }
        }
      },

      logout: () => {
        localStorage.removeItem('token');
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
