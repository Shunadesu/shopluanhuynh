import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cartCount } = useCartStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LH</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Shopluanhuynh</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">
              Trang chủ
            </Link>
            <Link to="/shop" className="text-slate-300 hover:text-white transition-colors">
              Cửa hàng
            </Link>
            {isAuthenticated && (
              <Link to="/deposit" className="text-slate-300 hover:text-white transition-colors">
                Nạp tiền
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <FiShoppingCart className="w-6 h-6 text-slate-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiUser className="w-6 h-6 text-slate-300" />
                  <span className="text-slate-300 hidden sm:block">{user?.fullName}</span>
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
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary hidden sm:block">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {showMobileMenu ? (
                <FiX className="w-6 h-6 text-slate-300" />
              ) : (
                <FiMenu className="w-6 h-6 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/shop"
                className="px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Cửa hàng
              </Link>
              {isAuthenticated && (
                <Link
                  to="/deposit"
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Nạp tiền
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
