import { useEffect } from 'react';
import { useUserStore } from '../store/data/userStore';

const TTL = 60 * 1000;

export function useUserProfile({ enabled = true } = {}) {
  const data = useUserStore((s) => s.profile);
  const loading = useUserStore((s) => s.loading);
  const lastFetched = useUserStore((s) => s.lastFetched);

  useEffect(() => {
    if (!enabled) return;
    if (!data || Date.now() - lastFetched > TTL) {
      useUserStore.getState().fetchProfile().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    data,
    loading,
    refresh: () => useUserStore.getState().fetchProfile(true),
    setProfile: useUserStore.getState().setProfile,
  };
}
