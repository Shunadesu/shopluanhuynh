import { useEffect } from 'react';
import { useSettingsStore } from '../store/data/settingsStore';

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const loading = useSettingsStore((s) => s.loading.settings);
  const isStaleFn = useSettingsStore((s) => s.isStale);

  useEffect(() => {
    // Initial warm if needed (silent - error caught by store)
    if (!settings || isStaleFn('settings')) {
      useSettingsStore.getState().fetchSettings().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: settings,
    loading,
    refresh: () => useSettingsStore.getState().fetchSettings(true),
  };
}

export function useSocialLinks() {
  const data = useSettingsStore((s) => s.socialLinks);
  const loading = useSettingsStore((s) => s.loading.socialLinks);

  useEffect(() => {
    if (!data || useSettingsStore.getState().isStale('socialLinks')) {
      useSettingsStore.getState().fetchSocialLinks().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    refresh: () => useSettingsStore.getState().fetchSocialLinks(true),
  };
}

export function useSliders() {
  const data = useSettingsStore((s) => s.sliders);
  const loading = useSettingsStore((s) => s.loading.sliders);

  useEffect(() => {
    if (!data || useSettingsStore.getState().isStale('sliders')) {
      useSettingsStore.getState().fetchSliders().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    refresh: () => useSettingsStore.getState().fetchSliders(true),
  };
}

export function useNotifications() {
  const data = useSettingsStore((s) => s.notifications);
  const loading = useSettingsStore((s) => s.loading.notifications);

  useEffect(() => {
    if (!data || useSettingsStore.getState().isStale('notifications')) {
      useSettingsStore.getState().fetchNotifications().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    refresh: () => useSettingsStore.getState().fetchNotifications(true),
  };
}
