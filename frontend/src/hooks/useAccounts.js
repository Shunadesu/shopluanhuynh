import { useEffect, useMemo } from 'react';
import { useAccountListStore, accountListParamsKey } from '../store/data/accountListStore';
import { useAccountDetailStore } from '../store/data/accountDetailStore';

export function useAccountList(params = {}) {
  const key = useMemo(() => accountListParamsKey(params), [
    params.search,
    params.minPrice,
    params.maxPrice,
    params.page,
    params.limit,
    params.category,
  ]);
  const entry = useAccountListStore((s) => s.byFilter[key]);
  const loading = useAccountListStore((s) => s.loading[key]);

  useEffect(() => {
    if (!entry || useAccountListStore.getState().isStale(key)) {
      useAccountListStore.getState().fetchAccounts(params).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: entry?.data || null,
    accounts: entry?.accounts || [],
    pagination: entry?.pagination || null,
    loading: !!loading,
    refresh: () => useAccountListStore.getState().fetchAccounts(params, true),
  };
}

export function useAccountDetail(id) {
  const entry = useAccountDetailStore((s) => s.byId[id]);
  const loading = useAccountDetailStore((s) => s.loading[id]);

  useEffect(() => {
    if (!id) return;
    if (!entry || useAccountDetailStore.getState().isStale(id)) {
      useAccountDetailStore.getState().fetchAccount(id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    data: entry?.account || null,
    loading: !!loading,
    refresh: () => useAccountDetailStore.getState().fetchAccount(id, true),
    invalidate: () => useAccountDetailStore.getState().invalidate(id),
  };
}
