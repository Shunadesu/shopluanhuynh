import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiGrid, FiShoppingBag, FiShoppingCart,
  FiDollarSign, FiUsers, FiImage, FiBell, FiSettings, FiLogOut, FiCreditCard, FiCalendar
} from 'react-icons/fi';
import { GiSpinningBlades } from 'react-icons/gi';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Fetch pending deposits count
  const { data: pendingData } = useQuery({
    queryKey: ['deposits-pending-count'],
    queryFn: async () => {
      const { data } = await api.get('/admin/deposits/pending-count');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });

  const pendingCount = pendingData?.count || 0;

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/categories', icon: FiGrid, label: 'Danh mục' },
    { path: '/accounts', icon: FiShoppingBag, label: 'Tài khoản' },
    { path: '/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
    { path: '/deposits', icon: FiDollarSign, label: 'Nạp tiền', badge: pendingCount },
    { path: '/bank-accounts', icon: FiCreditCard, label: 'Tài khoản NH' },
    { path: '/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/sliders', icon: FiImage, label: 'Banner' },
    { path: '/spin-rewards', icon: GiSpinningBlades, label: 'Vòng quay' },
    { path: '/spin-history', icon: FiCalendar, label: 'Lịch sử quay' },
    { path: '/notifications', icon: FiBell, label: 'Thông báo' },
    { path: '/settings', icon: FiSettings, label: 'Cài đặt' },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-cyan-400">Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Shopluanhuynh</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="text-lg" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg mb-2">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200 border border-orange-500/30"
          >
            <FiLogOut />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
