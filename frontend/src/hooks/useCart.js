import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

export function useCart({ fetchOnMount = true } = {}) {
  const cartData = useCartStore((s) => s.cartData);
  const cartCount = useCartStore((s) => s.cartCount);
  const loading = useCartStore((s) => s.loading);
  const mutating = useCartStore((s) => s.mutating);

  useEffect(() => {
    if (fetchOnMount) {
      useCartStore.getState().fetchCart().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cartCount,
    items: cartData?.items || [],
    cartData,
    loading,
    mutating,
    fetch: () => useCartStore.getState().fetchCart(true),
    add: useCartStore.getState().addToCart,
    addViaAdd: useCartStore.getState().addToCartAdd,
    remove: useCartStore.getState().removeFromCart,
    clear: useCartStore.getState().clearCart,
    checkout: useCartStore.getState().checkout,
  };
}
