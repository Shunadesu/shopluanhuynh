import { useEffect } from 'react';
import { useCatalogStore } from '../store/data/catalogStore';

export function useCategories() {
  const data = useCatalogStore((s) => s.categories);
  const loading = useCatalogStore((s) => s.loading);

  useEffect(() => {
    if (!data || data.length === 0 || useCatalogStore.getState().isStale()) {
      useCatalogStore.getState().fetchCategories().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: data || [],
    loading,
    refresh: () => useCatalogStore.getState().fetchCategories(true),
  };
}
