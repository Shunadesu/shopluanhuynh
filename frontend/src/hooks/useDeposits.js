import { useEffect } from 'react';
import { useDepositStore } from '../store/data/depositStore';

const REQUESTS_TTL = 30 * 1000;

export function useBankAccounts() {
  const data = useDepositStore((s) => s.bankAccounts);
  const loading = useDepositStore((s) => s.banksLoading);
  const lastFetched = useDepositStore((s) => s.lastFetchedBanks);

  useEffect(() => {
    if (!data || data.length === 0 || Date.now() - lastFetched > 30 * 60 * 1000) {
      useDepositStore.getState().fetchBankAccounts().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useDepositStore.getState().fetchBankAccounts(true),
  };
}

export function useMyDepositRequests() {
  const data = useDepositStore((s) => s.myRequests);
  const loading = useDepositStore((s) => s.requestsLoading);
  const lastFetched = useDepositStore((s) => s.lastFetchedRequests);

  useEffect(() => {
    if (!data || Date.now() - lastFetched > REQUESTS_TTL) {
      useDepositStore.getState().fetchMyRequests().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useDepositStore.getState().fetchMyRequests(true),
  };
}

export function useTopDepositors() {
  const data = useDepositStore((s) => s.topDepositors);
  const loading = useDepositStore((s) => s.topLoading);
  const lastFetched = useDepositStore((s) => s.lastFetchedTop);

  useEffect(() => {
    if (!data || data.length === 0 || Date.now() - lastFetched > 10 * 60 * 1000) {
      useDepositStore.getState().fetchTopDepositors().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useDepositStore.getState().fetchTopDepositors(true),
  };
}
