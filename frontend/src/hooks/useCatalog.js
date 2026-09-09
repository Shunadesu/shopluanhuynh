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

// Hook để lấy subcategories của một category
export function useSubcategories(parentId) {
  const categories = useCatalogStore((s) => s.categories);
  const fetchCategories = useCatalogStore((s) => s.fetchCategories);
  const loading = useCatalogStore((s) => s.loading);

  useEffect(() => {
    if (!categories || categories.length === 0 || useCatalogStore.getState().isStale()) {
      fetchCategories().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lấy subcategories từ category gốc
  const subcategories = categories.find(c => c._id === parentId)?.subcategories || [];

  return {
    data: subcategories,
    loading,
    refresh: () => fetchCategories(true),
  };
}

// Kiểm tra category có subcategories không
export function useHasSubcategories(categoryId) {
  const hasSubcategories = useCatalogStore((s) => s.hasSubcategories);
  return hasSubcategories(categoryId);
}
