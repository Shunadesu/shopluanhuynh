import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import { useSettings } from '../hooks/useSettings';
import AuthDrawer from './AuthDrawer';
import CartDrawer from './CartDrawer';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSun, FiMoon, FiPlus } from 'react-icons/fi';
import { GiSpinningBlades } from 'react-icons/gi';

const Header = ({ onOpenAuth, onOpenCart, isAuthOpen, isCartOpen, onCloseAuth, onCloseCart, authInitialView = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.cartCount);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Resolve theme (fallback to DOM if not yet set in store)
  const isDark =
    theme !== null
      ? theme === 'dark'
      : typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // Fetch settings for logo
  const { data: settings } = useSettings();

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Header styles - always solid, themed colors
  const getHeaderClasses = () => {
    return 'fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800';
  };

  // Text/icon color helpers for header - themed colors
  const iconColor = () => {
    return isDark ? 'text-slate-300' : 'text-slate-700';
  };

  const hoverBg = () => {
    return isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';
  };

  const navLinkColor = (isActive) => {
    if (isActive) return 'text-primary';
    return isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900';
  };

  const mobileLinkColor = () => {
    return isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="Shopluanhuynh"
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LH</span>
                </div>
              )}

            </Link>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Balance Display - Only for authenticated users */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg px-3 py-1.5 border border-primary/20">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Số dư</span>
                    <span className="text-sm font-bold text-primary leading-tight">
                      {user?.balance?.toLocaleString('vi-VN') || '0'}đ
                    </span>
                  </div>
                  <Link
                    to="/profile?view=deposit"
                    className="p-1.5 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
                    title="Nạp tiền"
                  >
                    <FiPlus className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Spin Wheel Button - Only for authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/spin"
                  className={`relative p-2 rounded-lg transition-colors ${hoverBg()} group`}
                  title="Vòng quay may mắn"
                >
                  <GiSpinningBlades className={`w-6 h-6 ${iconColor()} group-hover:animate-spin`} />
                  {(user?.spins || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {user.spins}
                    </span>
                  )}
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${hoverBg()}`}
                aria-label="Toggle theme"
                title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              >
                {isDark ? (
                  <FiSun className={`w-5 h-5 ${iconColor()}`} />
                ) : (
                  <FiMoon className={`w-5 h-5 ${iconColor()}`} />
                )}
              </button>

              {/* Cart - Always visible */}
              <button
                onClick={onOpenCart}
                className={`relative p-2 rounded-lg transition-colors ${hoverBg()}`}
              >
                <FiShoppingCart className={`w-6 h-6 ${iconColor()}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${hoverBg()}`}
                  >
                    <FiUser className={`w-6 h-6 ${iconColor()}`} />
                    <span className={`hidden sm:block ${iconColor()}`}>
                      {user?.fullName}
                    </span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20">
                        <Link
                          to="/profile"
                          className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Tài khoản
                        </Link>
                        <Link
                          to="/spin"
                          className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-between"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="flex items-center gap-2">
                            <GiSpinningBlades />
                            Vòng quay
                          </span>
                          {(user?.spins || 0) > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              {user.spins}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/profile?view=orders"
                          className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Đơn hàng
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-2"
                        >
                          <FiLogOut />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Login/Register Buttons - Open Drawer */
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className={`hidden sm:block px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`md:hidden p-2 rounded-lg transition-colors ${hoverBg()}`}
              >
                <FiMenu className={`w-6 h-6 ${iconColor()}`} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-dark/95 backdrop-blur-md">
              {/* Balance Display - Mobile */}
              {isAuthenticated && (
                <div className="px-4 mb-4">
                  <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg px-4 py-3 border border-primary/20">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Số dư hiện tại</span>
                      <span className="text-lg font-bold text-primary">
                        {user?.balance?.toLocaleString('vi-VN') || '0'}đ
                      </span>
                    </div>
                    <Link
                      to="/profile?view=deposit"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Nạp tiền</span>
                    </Link>
                  </div>
                </div>
              )}

              <nav className="flex flex-col space-y-2">
                <Link
                  to="/profile?view=deposit"
                  className={`px-4 py-2 rounded-lg transition-colors ${mobileLinkColor()}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Nạp thẻ
                </Link>

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onOpenAuth('login');
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors text-left ${mobileLinkColor()}`}
                  >
                    Đăng nhập
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Drawers */}
      <AuthDrawer isOpen={isAuthOpen} onClose={onCloseAuth} initialView={authInitialView} />
      <CartDrawer isOpen={isCartOpen} onClose={onCloseCart} onOpenAuth={onOpenAuth} />
    </>
  );
};

export default Header;
