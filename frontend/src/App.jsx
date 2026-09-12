import { Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactFixed from './components/ContactFixed';
import BottomStatusBar from './components/BottomStatusBar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationModal from './components/NotificationModal';
import SEOHead from './components/SEOHead';
import { useThemeStore } from './store/themeStore';
import { useSettingsStore } from './store/data/settingsStore';
import { useCartStore } from './store/cartStore';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import AccountDetail from './pages/AccountDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import SpinWheel from './pages/SpinWheel';
import SpinHistory from './pages/SpinHistory';
import Guide from './pages/Guide';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import AccountSecurity from './pages/AccountSecurity';
import CardDeposit from './pages/CardDeposit';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

// Forward dynamic path params into query string (for backward-compat routes)
function RedirectWithParams({ paramName, view = 'order-detail', extraParams = {} }) {
  const params = useParams();
  const value = params[paramName];
  const search = new URLSearchParams({ view, ...extraParams });
  if (value) search.set(paramName, value);
  return <Navigate to={`/profile?${search.toString()}`} replace />;
}

function App() {
  const applyDefaultTheme = useThemeStore((s) => s.applyDefault);
  const settings = useSettingsStore((s) => s.settings);

  // Drawer state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');

  // Warm cache for hot data on mount (silent on error).
  // settings/socialLinks/sliders/notifications persist via localStorage so F5 stays instant.
  // cart is fetched fresh on mount and on auth changes.
  useEffect(() => {
    useSettingsStore.getState().fetchSettings().catch(() => {});
    useSettingsStore.getState().fetchSocialLinks().catch(() => {});
    useSettingsStore.getState().fetchSliders().catch(() => {});
    useSettingsStore.getState().fetchNotifications().catch(() => {});
    useCartStore.getState().fetchCart().catch(() => {});
  }, []);

  // Apply admin default theme on first load (only if user has no preference)
  useEffect(() => {
    if (settings) {
      applyDefaultTheme(settings.defaultTheme || 'light');
    }
  }, [settings, applyDefaultTheme]);

  // Update favicon dynamically from settings
  useEffect(() => {
    if (settings?.favicon) {
      const faviconLink = document.getElementById('favicon-link');
      if (faviconLink) {
        faviconLink.href = settings.favicon;
      }
    }
  }, [settings?.favicon]);

  // Drawer handlers
  const handleOpenAuth = useCallback((view = 'login') => {
    setAuthInitialView(view);
    setIsAuthOpen(true);
  }, []);

  const handleCloseAuth = useCallback(() => {
    setIsAuthOpen(false);
  }, []);

  const handleOpenCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Listen for openAuthDrawer event (from ProtectedRoute)
  useEffect(() => {
    const handleOpenAuthDrawer = (e) => {
      const view = e.detail?.view || 'login';
      handleOpenAuth(view);
    };

    window.addEventListener('openAuthDrawer', handleOpenAuthDrawer);
    return () => window.removeEventListener('openAuthDrawer', handleOpenAuthDrawer);
  }, [handleOpenAuth]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Default SEO Head - will be overridden by child pages */}
      <SEOHead
        title={settings?.seoTitle}
        description={settings?.seoDescription}
        keywords={settings?.seoKeywords}
        ogImage={settings?.ogImage}
        favicon={settings?.favicon}
        twitterCard={settings?.twitterCard || 'summary'}
      />
      {/* Pass drawer handlers to Header */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenCart={handleOpenCart}
        isAuthOpen={isAuthOpen}
        isCartOpen={isCartOpen}
        onCloseAuth={handleCloseAuth}
        onCloseCart={handleCloseCart}
        authInitialView={authInitialView}
      />

      <main className="flex-grow my-4">
        <Routes>
          {/* Redirect old orders routes (root-level /orders/:id) to Profile?view=order-detail */}
          <Route path="/orders/:id" element={<RedirectWithParams paramName="orderId" />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:categorySlug" element={<Shop />} />
          <Route path="/account/:id" element={<AccountDetail onOpenAuth={handleOpenAuth} />} />

          {/* Cart - Public (no auth required to add/view cart) */}
          <Route path="/cart" element={<Cart onOpenAuth={handleOpenAuth} />} />

          {/* Info Pages */}
          <Route path="/guide" element={<Guide />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/account-security" element={<AccountSecurity />} />

          {/* Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spin"
            element={<SpinWheel />}
          />
          <Route
            path="/spin/history"
            element={
              <ProtectedRoute>
                <SpinHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit/card"
            element={
              <ProtectedRoute>
                <CardDeposit />
              </ProtectedRoute>
            }
          />
          {/* Redirect backward-compat routes to Profile query params */}
          <Route path="/profile/orders" element={<Navigate to="/profile?view=orders" replace />} />
          <Route
            path="/profile/orders/:id"
            element={<RedirectWithParams paramName="orderId" />}
          />
          <Route path="/profile/deposits" element={<Navigate to="/profile?view=deposits" replace />} />
          <Route path="/profile/purchased-accounts" element={<Navigate to="/profile?view=purchased-accounts" replace />} />
          <Route path="/profile/policies" element={<Navigate to="/profile?view=policies" replace />} />
        </Routes>
      </main>

      <Footer />
      <ContactFixed />
      <BottomStatusBar />
      <NotificationModal />
    </div>
  );
}

export default App;
