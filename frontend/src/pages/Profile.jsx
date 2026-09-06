import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiUser, FiMail, FiPhone, FiDollarSign, FiShoppingBag, FiCreditCard, FiKey, FiCheckCircle, FiAlertCircle, FiBox, FiTrendingUp } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import { ProfileSkeleton } from '../components/SkeletonLoader';

const TABS = [
  { key: 'info',    label: 'Thông tin cá nhân',   icon: FiUser        },
  { key: 'orders',  label: 'Đơn hàng',            icon: FiShoppingBag },
  { key: 'deposits',label: 'Lịch sử nạp tiền',     icon: FiCreditCard  },
  { key: 'purchased',label: 'Tài khoản đã mua',    icon: FiKey         },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  if (isLoading) return <ProfileSkeleton />;

  const tabs = TABS;
  const totalOrders = user?.purchaseHistory?.length ?? 0;

  const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
        <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-12">
      <SEOHead
        title="Tài Khoản Của Tôi"
        description="Quản lý thông tin tài khoản, xem lịch sử đơn hàng, nạp tiền và các cài đặt khác."
        type="website"
      />
      <div className="container-custom space-y-4">

        {/* ── Hero Section ─────────────────────────────── */}
        <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6D00, #FFAB40)' }}>
                <FiUser className="w-10 h-10 text-white" />
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-dark-light flex items-center justify-center">
                <FiCheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white truncate">{user?.fullName}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Đã xác thực
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
                    <FiAlertCircle className="w-3.5 h-3.5" /> Chưa xác thực
                  </span>
                )}
                {user?.phone && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
                    <FiPhone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="shrink-0 w-full sm:w-auto bg-gradient-to-br from-primary-dark to-primary rounded-xl p-4 text-center sm:text-right">
              <p className="text-white/80 text-xs mb-1">Số dư tài khoản</p>
              <p className="text-white font-black text-2xl leading-none">
                {user?.balance?.toLocaleString('vi-VN')}đ
              </p>
              <Link
                to="/deposit"
                className="inline-block mt-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Nạp tiền
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard
            icon={FiShoppingBag}
            label="Tổng đơn hàng"
            value={totalOrders}
            accent="bg-blue-600"
          />
          <StatCard
            icon={FiBox}
            label="Tài khoản đã mua"
            value={totalOrders}
            accent="bg-purple-600"
          />
          <StatCard
            icon={FiDollarSign}
            label="Số dư hiện tại"
            value={`${user?.balance?.toLocaleString('vi-VN')}đ`}
            accent="bg-primary"
          />
          <StatCard
            icon={user?.isVerified ? FiCheckCircle : FiAlertCircle}
            label="Trạng thái"
            value={user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            accent={user?.isVerified ? 'bg-green-600' : 'bg-yellow-600'}
          />
        </div>

        {/* ── Tab Navigation ───────────────────────────── */}
        <div>
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === key
                    ? 'text-primary border-primary'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ──────────────────────────── */}
          <div className="mt-4">
            {activeTab === 'info' && (
              <div>
                {/* Animated border info card */}
                <div className="rounded-2xl p-[2px]"
                  style={{ background: 'linear-gradient(90deg, #D84315, #FF6D00, #FFAB40, #D84315)', backgroundSize: '300% 100%', animation: 'border-flow 2s linear infinite' }}>
                  <div className="bg-white dark:bg-dark-light rounded-[14px] p-6 space-y-0">
                    {[
                      { icon: FiUser,       label: 'Họ tên',            value: user?.fullName,                   mono: false },
                      { icon: FiMail,       label: 'Email',             value: user?.email,                      mono: false },
                      { icon: FiPhone,      label: 'Số điện thoại',     value: user?.phone || 'Chưa cập nhật',   mono: false },
                      { icon: FiShoppingBag,label: 'Tổng đơn hàng',      value: totalOrders,                      mono: true  },
                    ].map(({ icon: Icon, label, value, mono }, idx) => (
                      <div key={label} className={`flex items-start gap-3 py-4 ${idx < 3 ? 'border-b border-slate-200 dark:border-slate-700/60' : ''}`}>
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5">{label}</p>
                          <p className={`font-semibold text-base ${mono ? 'tabular-nums text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link to="/shop" className="card p-5 hover:border-primary/50 group transition-all text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <FiTrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">Mua tài khoản</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Khám phá cửa hàng</p>
                  </Link>
                  <Link to="/profile/orders" className="card p-5 hover:border-primary/50 group transition-all text-center">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <FiShoppingBag className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">Xem đơn hàng</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Lịch sử mua hàng</p>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card p-8 text-center">
                <FiShoppingBag className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Đơn hàng của bạn</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Xem lịch sử các đơn hàng đã đặt</p>
                <Link to="/profile/orders" className="btn-primary inline-flex items-center gap-2">
                  <FiShoppingBag className="w-4 h-4" /> Xem đơn hàng
                </Link>
              </div>
            )}

            {activeTab === 'deposits' && (
              <div className="card p-8 text-center">
                <FiCreditCard className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Lịch sử nạp tiền</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Theo dõi các khoản nạp đã thực hiện</p>
                <Link to="/profile/deposits" className="btn-primary inline-flex items-center gap-2">
                  <FiCreditCard className="w-4 h-4" /> Xem lịch sử
                </Link>
              </div>
            )}

            {activeTab === 'purchased' && (
              <div className="card p-8 text-center">
                <FiKey className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Tài khoản đã mua</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Danh sách các tài khoản game đã sở hữu</p>
                <Link to="/profile/purchased-accounts" className="btn-primary inline-flex items-center gap-2">
                  <FiKey className="w-4 h-4" /> Xem tài khoản
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes border-flow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;
