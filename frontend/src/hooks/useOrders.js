import { useEffect } from 'react';
import { useOrderStore } from '../store/data/orderStore';

const TTL = 60 * 1000;

export function useOrders() {
  const data = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.ordersLoading);
  const lastFetched = useOrderStore((s) => s.lastFetchedOrders);

  useEffect(() => {
    if (!data || data.length === 0 || Date.now() - lastFetched > TTL) {
      useOrderStore.getState().fetchOrders().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useOrderStore.getState().fetchOrders(true),
  };
}

export function useOrderDetail(id) {
  const entry = useOrderStore((s) => s.orderById[id]);
  const loading = useOrderStore((s) => s.orderLoading[id]);

  useEffect(() => {
    if (!id) return;
    if (!entry || Date.now() - entry.ts > TTL) {
      useOrderStore.getState().fetchOrderDetail(id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    data: entry?.order || null,
    loading: !!loading,
    refresh: () => useOrderStore.getState().fetchOrderDetail(id, true),
  };
}

export function usePurchasedAccounts() {
  const data = useOrderStore((s) => s.purchasedAccounts);
  const loading = useOrderStore((s) => s.purchasedLoading);
  const lastFetched = useOrderStore((s) => s.lastFetchedPurchased);

  useEffect(() => {
    if (!data || data.length === 0 || Date.now() - lastFetched > TTL) {
      useOrderStore.getState().fetchPurchasedAccounts().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useOrderStore.getState().fetchPurchasedAccounts(true),
  };
}
