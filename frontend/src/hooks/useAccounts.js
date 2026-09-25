import { useEffect, useMemo } from 'react';
import { useAccountListStore, accountListParamsKey } from '../store/data/accountListStore';
import { useAccountDetailStore } from '../store/data/accountDetailStore';

export function useAccountList(params = {}) {
  // `fetchAll` là flag nội bộ — không truyền xuống backend
  const { fetchAll = false, ...restParams } = params;

  const key = useMemo(() => {
    const baseKey = accountListParamsKey(restParams);
    return fetchAll ? `all:${baseKey}` : baseKey;
  }, [
    restParams.search,
    restParams.minPrice,
    restParams.maxPrice,
    restParams.page,
    restParams.limit,
    restParams.category,
    fetchAll,
  ]);
  const entry = useAccountListStore((s) => s.byFilter[key]);
  const loading = useAccountListStore((s) => s.loading[key]);

  useEffect(() => {
    if (!entry || useAccountListStore.getState().isStale(key)) {
      const fetcher = fetchAll
        ? useAccountListStore.getState().fetchAllAccounts
        : useAccountListStore.getState().fetchAccounts;
      fetcher(restParams).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: entry?.data || null,
    accounts: entry?.accounts || [],
    pagination: entry?.pagination || null,
    loading: !!loading,
    refresh: () => {
      const fetcher = fetchAll
        ? useAccountListStore.getState().fetchAllAccounts
        : useAccountListStore.getState().fetchAccounts;
      return fetcher(restParams, true);
    },
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
