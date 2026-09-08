import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/data/settingsStore';
import { useCartStore } from '../store/cartStore';

/**
 * Side-effectful component that drives the inline splash screen mounted in
 * index.html. It bumps the progress bar as bootstrap data lands and hides the
 * splash once the SPA has its initial data ready.
 *
 * Render returns null — this component exists only to react to store changes.
 *
 * Progress milestones:
 *  - DOM ready / window.load: handled by the inline boot script in index.html
 *  - settings loaded      -> 80%
 *  - socialLinks loaded   -> 85%
 *  - sliders loaded       -> 88%
 *  - notifications loaded -> 92%
 *  - cart resolved        -> 100% + hide
 */
export default function AppSplash() {
  // Read loading flags without subscribing to value props to avoid re-renders
  const settingsLoading = useSettingsStore((s) => s.loading.settings);
  const socialLoading = useSettingsStore((s) => s.loading.socialLinks);
  const slidersLoading = useSettingsStore((s) => s.loading.sliders);
  const notificationsLoading = useSettingsStore((s) => s.loading.notifications);
  const cartLoading = useCartStore((s) => s.loading);

  const lastFetched = useSettingsStore((s) => s.lastFetched);
  const cartLastFetched = useCartStore((s) => s.lastFetched);

  const hiddenRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const setProgress = window.__splashSetProgress;
    const hide = window.__splashHide;
    if (typeof setProgress !== 'function' || typeof hide !== 'function') return;

    // Settings loaded (only meaningful if we actually fetched this session)
    if (lastFetched.settings && !settingsLoading) setProgress(80);
    if (lastFetched.socialLinks && !socialLoading) setProgress(85);
    if (lastFetched.sliders && !slidersLoading) setProgress(88);
    if (lastFetched.notifications && !notificationsLoading) setProgress(92);

    // Cart resolved (either freshly fetched or persisted across F5)
    if (!cartLoading) {
      setProgress(100);
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        // Short delay so the 100% bar is visible briefly before fade
        setTimeout(hide, 250);
      }
    }
  }, [
    settingsLoading,
    socialLoading,
    slidersLoading,
    notificationsLoading,
    cartLoading,
    lastFetched.settings,
    lastFetched.socialLinks,
    lastFetched.sliders,
    lastFetched.notifications,
    cartLastFetched,
  ]);

  return null;
}