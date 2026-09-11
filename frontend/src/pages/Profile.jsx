import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useOrders, useOrderDetail, usePurchasedAccounts } from '../hooks/useOrders';
import { useMyDepositRequests } from '../hooks/useDeposits';
import { useDepositStore } from '../store/data/depositStore';
import Skeleton from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import AccountSidebar from '../components/AccountSidebar';
import DepositPanel from '../components/DepositPanel';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  FiUser,
  FiAtSign,
  FiPhone,
  FiDollarSign,
  FiShoppingBag,
  FiCreditCard,
  FiKey,
  FiCheckCircle,
  FiBox,
  FiTrendingUp,
  FiPackage,
  FiClock,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiX,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiTag,
  FiServer,
  FiLock,
  FiInfo,
  FiCalendar,
  FiTrash2,
} from 'react-icons/fi';

// ── Tabs for main profile view ───────────────────────────────
const TABS = [
  { key: 'info',     label: 'Thông tin cá nhân',  icon: FiUser        },
  { key: 'orders',   label: 'Đơn hàng',            icon: FiShoppingBag },
  { key: 'deposits', label: 'Lịch sử nạp tiền',    icon: FiCreditCard  },
  { key: 'purchased',label: 'Tài khoản đã mua',    icon: FiKey         },
];

// ── Order status tabs ─────────────────────────────────────────
const ORDER_TABS = [
  { key: 'all',       label: 'Tất cả',       icon: FiPackage    },
  { key: 'pending',   label: 'Đang xử lý',   icon: FiClock      },
  { key: 'completed', label: 'Hoàn thành',   icon: FiCheckCircle },
  { key: 'cancelled', label: 'Đã hủy',       icon: FiXCircle    },
];

const ORDER_STATUS = {
  completed: { icon: FiCheckCircle, label: 'Hoàn thành', cls: 'bg-green-500/20 text-green-400 border-green-500/40' },
  pending:   { icon: FiClock,      label: 'Đang xử lý', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  cancelled: { icon: FiXCircle,    label: 'Đã hủy',     cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
  processing:{ icon: FiClock,      label: 'Đang xử lý', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
};

const OrderStatusBadge = ({ status }) => {
  const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const DepositStatusBadge = ({ status }) => {
  const map = {
    approved: { icon: FiCheckCircle, label: 'Đã duyệt', cls: 'bg-green-500/20 text-green-500' },
    pending:  { icon: FiClock,       label: 'Chờ duyệt', cls: 'bg-yellow-500/20 text-yellow-500' },
    rejected: { icon: FiXCircle,     label: 'Từ chối',  cls: 'bg-red-500/20 text-red-500' },
  };
  const cfg = map[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${cfg.cls}`}>
      <Icon /> <span>{cfg.label}</span>
    </span>
  );
};

// ════════════════════════════════════════════════════════════════
// Main Profile component
// ════════════════════════════════════════════════════════════════
const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const orderIdParam = searchParams.get('orderId');
  const isDepositView = viewParam === 'deposit';
  const isOrdersView = viewParam === 'orders';
  const isOrderDetailView = viewParam === 'order-detail';
  const isPurchasedView = viewParam === 'purchased-accounts';
  const isDepositsView = viewParam === 'deposits';

  const [activeTab, setActiveTab] = useState('info');
  const { data: user, loading: isLoading } = useUserProfile();

  // Reset activeTab when entering deposit view
  useEffect(() => {
    if (isDepositView) setActiveTab('info');
  }, [isDepositView]);

  const navigateTo = (params) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace: false });
  };

  const seoTitle = isOrderDetailView
    ? 'Chi tiết đơn hàng'
    : isOrdersView ? 'Đơn Hàng Của Tôi'
    : isPurchasedView ? 'Tài khoản đã mua'
    : isDepositsView ? 'Lịch sử nạp tiền'
    : isDepositView ? 'Nạp tiền'
    : 'Tài Khoản Của Tôi';

  return (
    <div className="min-h-screen pt-16 pb-6">
      <SEOHead
        title={seoTitle}
        description="Quản lý thông tin tài khoản, đơn hàng, nạp tiền và các cài đặt khác."
        type="website"
      />
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <AccountSidebar />

          <div className="space-y-4 min-w-0">
            {isDepositView ? (
              isLoading ? <ContentSkeleton /> : <DepositPanel user={user} />
            ) : isOrderDetailView && orderIdParam ? (
              <OrderDetailSection
                orderId={orderIdParam}
                onBack={() => navigateTo({ view: 'orders', orderId: null })}
              />
            ) : isOrdersView ? (
              <OrdersSection
                onOpenDetail={(id) => navigateTo({ view: 'order-detail', orderId: id })}
              />
            ) : isPurchasedView ? (
              <PurchasedAccountsSection />
            ) : isDepositsView ? (
              <DepositsSection
                onDeposit={() => navigateTo({ view: 'deposit' })}
              />
            ) : (
              <DefaultProfileView
                user={user}
                isLoading={isLoading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                navigateTo={navigateTo}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
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

// ════════════════════════════════════════════════════════════════
// Default Profile View (info, tabs, quick actions)
// ════════════════════════════════════════════════════════════════
const DefaultProfileView = ({ user, isLoading, activeTab, setActiveTab, navigateTo, searchParams, setSearchParams }) => {
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

  if (isLoading) return <ContentSkeleton />;

  return (
    <>
      {/* ── Hero Section ─────────────────────────── */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6D00, #FFAB40)' }}
            >
              <FiUser className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-dark-light flex items-center justify-center">
              <FiCheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white truncate">{user?.fullName}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">@{user?.username}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {user?.phone && (
                <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
                  <FiPhone className="w-3.5 h-3.5" /> {user.phone}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 w-full sm:w-auto bg-gradient-to-br from-primary-dark to-primary rounded-xl p-4 text-center sm:text-right">
            <p className="text-white/80 text-xs mb-1">Số dư tài khoản</p>
            <p className="text-white font-black text-2xl leading-none">
              {user?.balance?.toLocaleString('vi-VN')}đ
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({ view: 'deposit' })}
              className="inline-block mt-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Nạp tiền
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard icon={FiShoppingBag} label="Tổng đơn hàng" value={totalOrders} accent="bg-blue-600" />
        <StatCard icon={FiBox} label="Tài khoản đã mua" value={totalOrders} accent="bg-purple-600" />
        <StatCard
          icon={FiDollarSign}
          label="Số dư hiện tại"
          value={`${user?.balance?.toLocaleString('vi-VN')}đ`}
          accent="bg-primary"
        />
        <StatCard
          icon={FiKey}
          label="Vai trò"
          value={user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
          accent={user?.role === 'admin' ? 'bg-green-600' : 'bg-blue-600'}
        />
      </div>

      {/* ── Tab Navigation ───────────────────────── */}
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

        <div className="mt-4">
          {activeTab === 'info' && (
            <div>
              <div
                className="rounded-2xl p-[2px]"
                style={{
                  background: 'linear-gradient(90deg, #D84315, #FF6D00, #FFAB40, #D84315)',
                  backgroundSize: '300% 100%',
                  animation: 'border-flow 2s linear infinite',
                }}
              >
                <div className="bg-white dark:bg-dark-light rounded-[14px] p-6 space-y-0">
                  {[
                    { icon: FiUser, label: 'Họ tên', value: user?.fullName, mono: false },
                    { icon: FiAtSign, label: 'Tên đăng nhập', value: `@${user?.username}`, mono: true },
                    { icon: FiPhone, label: 'Số điện thoại', value: user?.phone || 'Chưa cập nhật', mono: false },
                    { icon: FiShoppingBag, label: 'Tổng đơn hàng', value: totalOrders, mono: true },
                  ].map(({ icon: Icon, label, value, mono }, idx) => (
                    <div
                      key={label}
                      className={`flex items-start gap-3 py-4 ${
                        idx < 3 ? 'border-b border-slate-200 dark:border-slate-700/60' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5">{label}</p>
                        <p
                          className={`font-semibold text-base ${
                            mono ? 'tabular-nums text-primary' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'orders' })}
                  className="card p-5 hover:border-primary/50 group transition-all text-center"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FiShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">Mua tài khoản</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Khám phá cửa hàng</p>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'orders' })}
                  className="card p-5 hover:border-primary/50 group transition-all text-center"
                >
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FiTrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">Xem đơn hàng</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Lịch sử mua hàng</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card p-8 text-center">
              <FiShoppingBag className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Đơn hàng của bạn</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Xem lịch sử các đơn hàng đã đặt</p>
              <button onClick={() => navigateTo({ view: 'orders' })} className="btn-primary inline-flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4" /> Xem đơn hàng
              </button>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="card p-8 text-center">
              <FiCreditCard className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Lịch sử nạp tiền</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Theo dõi các khoản nạp đã thực hiện</p>
              <button onClick={() => navigateTo({ view: 'deposits' })} className="btn-primary inline-flex items-center gap-2">
                <FiCreditCard className="w-4 h-4" /> Xem lịch sử
              </button>
            </div>
          )}

          {activeTab === 'purchased' && (
            <div className="card p-8 text-center">
              <FiKey className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Tài khoản đã mua</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Danh sách các tài khoản game đã sở hữu</p>
              <button onClick={() => navigateTo({ view: 'purchased-accounts' })} className="btn-primary inline-flex items-center gap-2">
                <FiKey className="w-4 h-4" /> Xem tài khoản
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// Orders Section
// ════════════════════════════════════════════════════════════════
const OrdersSection = ({ onOpenDetail }) => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: orders, loading: isLoading, refresh } = useOrders();

  if (isLoading) return <OrdersSectionSkeleton />;

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);
  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };
  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <>
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Đơn hàng của tôi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi và quản lý các đơn hàng đã đặt</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors shrink-0"
          >
            ↻ Làm mới
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <FiPackage className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Tổng đơn hàng</p>
            <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">{counts.all}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center shrink-0">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Đang xử lý</p>
            <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">{counts.pending}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
            <FiCheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Hoàn thành</p>
            <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">{counts.completed}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <FiDollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Đã chi tiêu</p>
            <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">
              {totalSpent > 0 ? `${totalSpent.toLocaleString('vi-VN')}đ` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
          {ORDER_TABS.map(({ key, label, icon: Icon }) => (
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
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === key
                    ? 'bg-primary/20 text-primary'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Order list */}
        <div className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <EmptyState
              icon={FiShoppingBag}
              title="Chưa có đơn hàng nào"
              desc="Bắt đầu mua tài khoản game yêu thích của bạn"
              ctaLabel="Mua ngay"
              ctaHref="/shop"
            />
          ) : filtered.length === 0 ? (
            <EmptyState icon={FiX} title="Không có đơn hàng" desc="Không tìm thấy đơn hàng nào trong danh mục này" />
          ) : (
            filtered.map((order) => <OrderCard key={order._id} order={order} onOpenDetail={onOpenDetail} />)
          )}
        </div>
      </div>
    </>
  );
};

// ── Order Card ───────────────────────────────────────────────
const OrderCard = ({ order, onOpenDetail }) => (
  <div
    className="card hover:border-primary/40 transition-all group"
    style={{ background: 'linear-gradient(135deg, rgba(255,109,0,0.04) 0%, rgba(20,22,30,0) 60%)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-slate-900 dark:text-white font-bold text-base">#{order.orderNumber}</h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-slate-500 dark:text-slate-500 text-xs">
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-slate-500 dark:text-slate-500 text-xs mb-0.5">Tổng tiền</p>
        <p className="text-primary font-black text-lg leading-tight">
          {order.totalAmount?.toLocaleString('vi-VN')}đ
        </p>
      </div>
    </div>

    {order.items?.length > 0 && (
      <div className="mb-4">
        <p className="text-slate-500 dark:text-slate-500 text-xs mb-2">{order.items.length} sản phẩm</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {order.items.slice(0, 4).map((item, idx) => (
            item.accountId && (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl min-w-0 shrink-0"
              >
                <img
                  src={item.accountId.images?.[0]}
                  alt=""
                  className="w-8 h-8 rounded object-cover shrink-0"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <span className="text-slate-700 dark:text-slate-300 text-xs line-clamp-1 max-w-[120px]">
                  {item.accountId.title}
                </span>
              </div>
            )
          ))}
          {order.items.length > 4 && (
            <div className="flex items-center px-3 py-2 text-slate-500 text-xs shrink-0">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      </div>
    )}

    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-500 text-xs">
        Thanh toán: <span className="text-slate-700 dark:text-slate-300">Số dư tài khoản</span>
      </p>
      <button
        type="button"
        onClick={() => onOpenDetail(order._id)}
        className="flex items-center gap-1 text-primary hover:text-primary-light text-sm font-semibold transition-colors"
      >
        Xem chi tiết <FiArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// Order Detail Section
// ════════════════════════════════════════════════════════════════
const OrderDetailSection = ({ orderId, onBack }) => {
  const [showPasswords, setShowPasswords] = useState({});
  const { data: order, loading: isLoading } = useOrderDetail(orderId);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`Đã copy ${label}`));
  };

  const togglePassword = (accountId) => {
    setShowPasswords((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  if (isLoading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <FiInfo className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-900 dark:text-white text-xl font-bold mb-2">Không tìm thấy đơn hàng</p>
        <button onClick={onBack} className="btn-primary inline-flex items-center gap-2 mt-4">
          <FiArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const statusCfg = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
        <button onClick={() => { setShowPasswords({}); onBack(); }} className="hover:text-primary transition-colors">
          Đơn hàng
        </button>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">#{order.orderNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Hero */}
          <div className="rounded-2xl p-[2px] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="bg-white dark:bg-dark rounded-[14px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      order.status === 'completed' ? 'bg-green-500/20'
                        : order.status === 'cancelled' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}
                  >
                    <StatusIcon
                      className={`w-7 h-7 ${
                        order.status === 'completed' ? 'text-green-400'
                          : order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">#{order.orderNumber}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FiShoppingBag className="text-primary" />
              Sản phẩm đã mua
              <span className="text-slate-500 dark:text-slate-500 font-normal text-sm">
                ({order.items?.length})
              </span>
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                item.accountId && (
                  <AccountItem
                    key={idx}
                    item={item}
                    orderStatus={order.status}
                    showPasswords={showPasswords}
                    onTogglePassword={togglePassword}
                    onCopy={copyToClipboard}
                  />
                )
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
          </button>
        </div>

        {/* Right column summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiInfo className="text-primary" /> Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                item.accountId && (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                    <img
                      src={item.accountId.images?.[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white text-sm font-medium line-clamp-1">
                        {item.accountId.title}
                      </p>
                      <p className="text-primary font-semibold text-sm">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                <span>Số sản phẩm</span><span>{order.items?.length}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                <span>Phương thức</span><span>Số dư TK</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-black text-xl pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Tổng cộng</span>
                <span className="text-primary">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            {order.status === 'completed' && (
              <Link to="/shop" className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <FiTrendingUp className="w-4 h-4" /> Mua thêm tài khoản
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── AccountItem (credential reveal) ───────────────────────────
const AccountItem = ({ item, orderStatus, showPasswords, onTogglePassword, onCopy }) => {
  const acc = item.accountId;
  const visible = showPasswords[acc._id];
  const isCompleted = orderStatus === 'completed';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-light p-5">
      <div className="flex gap-4 mb-4">
        <img
          src={acc.images?.[0]}
          alt={acc.title}
          className="w-24 h-24 rounded-xl object-cover shrink-0"
          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-slate-900 dark:text-white font-bold text-base mb-2 line-clamp-2">{acc.title}</h4>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {acc.rank && (
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/30">
                <FiTag className="w-3 h-3" /> {acc.rank}
              </span>
            )}
            {acc.server && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                <FiServer className="w-3 h-3" /> {acc.server}
              </span>
            )}
            {acc.category && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                {acc.category.name}
              </span>
            )}
          </div>
          <p className="text-primary font-bold text-base">{item.price?.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      {isCompleted && (acc.username || acc.password) && (
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <FiLock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-bold">Thông tin tài khoản</span>
          </div>

          {acc.username && (
            <CredentialRow
              label="Tài khoản"
              value={acc.username}
              canReveal={false}
              onCopy={() => onCopy(acc.username, 'tài khoản')}
            />
          )}
          {acc.password && (
            <CredentialRow
              label="Mật khẩu"
              value={acc.password}
              visible={visible}
              canReveal={true}
              onReveal={() => onTogglePassword(acc._id)}
              onCopy={() => onCopy(acc.password, 'mật khẩu')}
            />
          )}
          {acc.password2 && (
            <CredentialRow
              label="Mật khẩu 2"
              value={acc.password2}
              visible={visible}
              canReveal={true}
              onReveal={() => onTogglePassword(acc._id)}
              onCopy={() => onCopy(acc.password2, 'mật khẩu 2')}
            />
          )}
          {acc.additionalInfo && (
            <div>
              <p className="text-slate-500 dark:text-slate-500 text-xs mb-1 font-medium">Thông tin thêm</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                {acc.additionalInfo}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CredentialRow = ({ label, value, visible, canReveal, onReveal, onCopy }) => (
  <div>
    <p className="text-slate-500 dark:text-slate-500 text-xs mb-1 font-medium">{label}</p>
    <div className="flex items-center gap-2">
      <input
        type={canReveal && !visible ? 'password' : 'text'}
        value={value}
        readOnly
        className="input-field flex-1 !py-2.5 !px-3 text-sm"
      />
      {canReveal && (
        <button
          type="button"
          onClick={onReveal}
          className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors shrink-0"
          title={visible ? 'Ẩn' : 'Hiện'}
        >
          {visible ? <FiEyeOff className="w-4 h-4 text-slate-700 dark:text-slate-300" /> : <FiEye className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
        </button>
      )}
      <button
        type="button"
        onClick={onCopy}
        className="p-2.5 bg-primary hover:bg-primary-dark rounded-lg transition-colors shrink-0"
        title="Copy"
      >
        <FiCopy className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// Purchased Accounts Section
// ════════════════════════════════════════════════════════════════
const PurchasedAccountsSection = () => {
  const [showPasswords, setShowPasswords] = useState({});
  const { data: accounts, loading: isLoading } = usePurchasedAccounts();

  const groupedAccounts = useMemo(() => {
    return accounts?.reduce((groups, item) => {
      const orderId = item.orderId;
      if (!groups[orderId]) {
        groups[orderId] = { orderNumber: item.orderNumber, orderDate: item.orderDate, accounts: [] };
      }
      groups[orderId].accounts.push(item);
      return groups;
    }, {}) || {};
  }, [accounts]);

  if (isLoading) return <PurchasedSectionSkeleton />;

  return (
    <>
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Tài khoản đã mua</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{accounts?.length || 0} tài khoản đã mua</p>
      </div>

      {!accounts || accounts.length === 0 ? (
        <EmptyState
          icon={FiShoppingBag}
          title="Chưa có tài khoản nào"
          desc="Bạn chưa mua tài khoản nào từ shop"
          ctaLabel="Mua tài khoản ngay"
          ctaHref="/shop"
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAccounts).map(([orderId, group]) => (
            <div key={orderId} className="card">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2.5 rounded-lg">
                    <FiShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Đơn hàng #{group.orderNumber}</h3>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                      <FiCalendar className="w-3.5 h-3.5 mr-1" />
                      {format(new Date(group.orderDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </div>
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">Hoàn thành</span>
              </div>
              <div className="space-y-3">
                {group.accounts.map((item) => (
                  <PurchasedAccountItem
                    key={item.account._id}
                    item={item}
                    showPasswords={showPasswords}
                    setShowPasswords={setShowPasswords}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const PurchasedAccountItem = ({ item, showPasswords, setShowPasswords }) => {
  const acc = item.account;
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };
  const toggle = (id) => setShowPasswords((p) => ({ ...p, [id]: !p[id] }));
  const visible = showPasswords[acc._id];

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <img
          src={acc.images?.[0] || '/placeholder.jpg'}
          alt={acc.title}
          className="w-full md:w-32 h-32 object-cover rounded-lg shrink-0"
        />
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="min-w-0">
              <h4 className="text-slate-900 dark:text-white font-semibold text-base mb-2 line-clamp-2">{acc.title}</h4>
              <div className="flex flex-wrap gap-2">
                {acc.categoryId?.name && (
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                    {acc.categoryId.name}
                  </span>
                )}
                {acc.teamValue && (
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center">
                    <FiTag className="w-3 h-3 mr-1" /> Đội hình: {acc.teamValue}
                  </span>
                )}
                {acc.bp && (
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                    BP: {acc.bp}
                  </span>
                )}
              </div>
            </div>
            {/* <span className="text-primary font-bold text-lg shrink-0">{acc.price?.toLocaleString('vi-VN')}đ</span> */}
          </div>

          <div className="bg-slate-50 dark:bg-dark-lighter rounded-lg p-4 space-y-3 border border-slate-200 dark:border-transparent">
            <p className="text-green-500 dark:text-green-400 font-semibold text-sm flex items-center">
              <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
              Thông tin tài khoản
            </p>
            <CredentialRow
              label="Tài khoản"
              value={acc.username}
              canReveal={false}
              onCopy={() => copyToClipboard(acc.username, 'tài khoản')}
            />
            <CredentialRow
              label="Mật khẩu"
              value={acc.password}
              visible={visible}
              canReveal={true}
              onReveal={() => toggle(acc._id)}
              onCopy={() => copyToClipboard(acc.password, 'mật khẩu')}
            />
            {acc.password2 && (
              <CredentialRow
                label="Mật khẩu 2"
                value={acc.password2}
                visible={showPasswords[`${acc._id}_2`]}
                canReveal={true}
                onReveal={() => toggle(`${acc._id}_2`)}
                onCopy={() => copyToClipboard(acc.password2, 'mật khẩu 2')}
              />
            )}
            {acc.additionalInfo && (
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Thông tin thêm</p>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">{acc.additionalInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// Deposits Section
// ════════════════════════════════════════════════════════════════
const DepositsSection = ({ onDeposit }) => {
  const { data: deposits, loading: isLoading, refresh } = useMyDepositRequests();
  const cancelRequest = useDepositStore((s) => s.cancelMyRequest);

  const handleCancel = async (depositId) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu nạp tiền này?')) return;
    try {
      await cancelRequest(depositId);
      toast.success('Đã hủy yêu cầu nạp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy yêu cầu');
    }
  };

  if (isLoading) return <DepositsSectionSkeleton />;

  return (
    <>
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Lịch sử nạp tiền</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi các giao dịch nạp tiền</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={refresh} className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm">
              ↻ Làm mới
            </button>
            <button type="button" onClick={onDeposit} className="btn-primary text-sm py-2 px-4">
              Nạp tiền
            </button>
          </div>
        </div>
      </div>

      {!deposits || deposits.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title="Chưa có lịch sử nạp tiền"
          desc="Bạn chưa thực hiện giao dịch nạp tiền nào"
          ctaLabel="Nạp tiền ngay"
          onClick={onDeposit}
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold w-12">STT</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">Ngày</th>
                  <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">Số tiền</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">Ngân hàng</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">Nội dung CK</th>
                  <th className="text-center px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit, i) => (
                  <tr key={deposit._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-primary font-bold text-right whitespace-nowrap">
                      +{deposit.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[200px]">
                      {deposit.bankAccountId ? (
                        <div>
                          <p className="font-semibold">{deposit.bankAccountId.bankName}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{deposit.bankAccountId.accountNumber}</p>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">
                      {deposit.transferNote || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DepositStatusBadge status={deposit.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// Shared Empty State
// ════════════════════════════════════════════════════════════════
const EmptyState = ({ icon: Icon, title, desc, ctaLabel, ctaHref, onClick }) => (
  <div className="card p-12 text-center">
    <Icon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
    <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{title}</p>
    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{desc}</p>
    {ctaHref ? (
      <Link to={ctaHref} className="btn-primary inline-flex items-center gap-2">
        <Icon className="w-4 h-4" /> {ctaLabel}
      </Link>
    ) : ctaLabel ? (
      <button onClick={onClick} className="btn-primary inline-flex items-center gap-2">
        <Icon className="w-4 h-4" /> {ctaLabel}
      </button>
    ) : null}
  </div>
);

// ════════════════════════════════════════════════════════════════
// Skeletons (inline for instant render)
// ════════════════════════════════════════════════════════════════
const ContentSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-16 w-40 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-4 space-y-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  </div>
);

const OrdersSectionSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-4 space-y-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
    <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-32 rounded-t-lg" />
      ))}
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="card p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-12 w-36 rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const OrderDetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border p-5 space-y-3">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

const PurchasedSectionSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 rounded-2xl" />
    {[1, 2].map((i) => (
      <div key={i} className="card p-5 space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="rounded-lg p-4 space-y-3">
          <div className="flex gap-4">
            <Skeleton className="w-32 h-32 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DepositsSectionSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 rounded-2xl" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

export default Profile;
