import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import api from '../utils/api';
import AuthDrawer from './AuthDrawer';
import CartDrawer from './CartDrawer';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';

const Header = ({ onOpenAuth, onOpenCart, isAuthOpen, isCartOpen, onCloseAuth, onCloseCart, authInitialView = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cartCount } = useCartStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if on home page
  const isHomePage = location.pathname === '/';

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch settings for logo
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data;
    },
  });

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

  // Dynamic header styles based on page and scroll position
  const getHeaderClasses = () => {
    const base = 'fixed top-0 left-0 right-0 z-40 transition-all duration-300';
    
    if (isHomePage) {
      // Home page: transparent when at top, gradient when scrolled
      if (isScrolled) {
        return `${base} bg-gradient-to-b from-dark/90 to-dark/95 backdrop-blur-md border-b border-slate-800/50`;
      }
      return `${base} bg-transparent border-b border-transparent`;
    }
    
    // Other pages: always solid background
    return `${base} bg-dark/95 backdrop-blur-sm border-b border-slate-800`;
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="Shopluanhuynh"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LH</span>
                </div>
              )}
              
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/shop" 
                className={`nav-link px-4 py-2 ${
                  location.pathname === '/shop' ? 'text-primary' : ''
                }`}
              >
                Tài khoản
              </Link>
              <Link 
                to="/deposit" 
                className={`nav-link px-4 py-2 ${
                  location.pathname === '/deposit' ? 'text-primary' : ''
                }`}
              >
                Nạp thẻ
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Cart - Always visible */}
              <button
                onClick={onOpenCart}
                className={`relative p-2 rounded-lg transition-colors ${
                  isHomePage && !isScrolled 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-slate-800'
                }`}
              >
                <FiShoppingCart className={`w-6 h-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-slate-300'}`} />
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
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isHomePage && !isScrolled 
                        ? 'hover:bg-white/10' 
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <FiUser className={`w-6 h-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-slate-300'}`} />
                    <span className={`hidden sm:block ${isHomePage && !isScrolled ? 'text-white' : 'text-slate-300'}`}>
                      {user?.fullName}
                    </span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-dark-light border border-slate-700 rounded-lg shadow-xl z-20">
                        <Link
                          to="/profile"
                          className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Tài khoản
                        </Link>
                        <Link
                          to="/profile/orders"
                          className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Đơn hàng
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-800 transition-colors flex items-center space-x-2"
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
                      isHomePage && !isScrolled 
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                        : 'bg-slate-700 text-white hover:bg-slate-600'
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
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isHomePage && !isScrolled 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-slate-800'
                }`}
              >
                <FiMenu className={`w-6 h-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-slate-300'}`} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-slate-800">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/shop"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isHomePage && !isScrolled 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Tài khoản
                </Link>
                <Link
                  to="/deposit"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isHomePage && !isScrolled 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
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
                    className={`px-4 py-2 rounded-lg transition-colors text-left ${
                      isHomePage && !isScrolled 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
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
