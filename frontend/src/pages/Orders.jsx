import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import SEOHead from '../components/SEOHead';
import { OrdersSkeleton } from '../components/SkeletonLoader';
import AccountSidebar from '../components/AccountSidebar';
import {
  FiPackage, FiClock, FiCheckCircle, FiXCircle,
  FiArrowRight, FiShoppingBag, FiDollarSign, FiX
} from 'react-icons/fi';

const TABS = [
  { key: 'all',       label: 'Tất cả',       icon: FiPackage    },
  { key: 'pending',   label: 'Đang xử lý',   icon: FiClock      },
  { key: 'completed', label: 'Hoàn thành',   icon: FiCheckCircle },
  { key: 'cancelled', label: 'Đã hủy',       icon: FiXCircle    },
];

const StatusBadge = ({ status }) => {
  const map = {
    completed: {
      icon: FiCheckCircle,
      label: 'Hoàn thành',
      cls: 'bg-green-500/20 text-green-400 border-green-500/40',
    },
    pending: {
      icon: FiClock,
      label: 'Đang xử lý',
      cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    },
    cancelled: {
      icon: FiXCircle,
      label: 'Đã hủy',
      cls: 'bg-red-500/20 text-red-400 border-red-500/40',
    },
    processing: {
      icon: FiClock,
      label: 'Đang xử lý',
      cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');

  const { data: orders, loading: isLoading } = useOrders();

  if (isLoading) return <OrdersSkeleton />;

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const counts = {
    all:       orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const totalSpent = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen pt-20 pb-6">
      <SEOHead
        title="Đơn Hàng Của Tôi"
        description="Xem và quản lý lịch sử đơn hàng đã mua tài khoản game."
        type="website"
      />
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <AccountSidebar />

          <div className="space-y-4 min-w-0">
        {/* ── Hero ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Đơn hàng của tôi</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi và quản lý các đơn hàng đã đặt</p>
            </div>
            <Link
              to="/profile"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm flex items-center gap-1 transition-colors shrink-0"
            >
              ← Quay lại
            </Link>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────── */}
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

        {/* ── Tabs ───────────────────────────────────────── */}
        <div>
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label, icon: Icon }) => (
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
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === key ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* ── Order List ─────────────────────────────── */}
          <div className="mt-4 space-y-3">
            {!orders || orders.length === 0 ? (
              <div className="card p-12 text-center">
                <FiShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Chưa có đơn hàng nào</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Bắt đầu mua tài khoản game yêu thích của bạn</p>
                <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                  <FiShoppingBag className="w-4 h-4" /> Mua ngay
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-12 text-center">
                <FiX className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Không có đơn hàng</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Không tìm thấy đơn hàng nào trong danh mục này</p>
              </div>
            ) : (
              filtered.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────
const OrderCard = ({ order }) => (
  <div
    className="card hover:border-primary/40 transition-all group"
    style={{ background: 'linear-gradient(135deg, rgba(255,109,0,0.04) 0%, rgba(20,22,30,0) 60%)' }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-slate-900 dark:text-white font-bold text-base">#{order.orderNumber}</h3>
          <StatusBadge status={order.status} />
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

    {/* Product thumbnails */}
    {order.items?.length > 0 && (
      <div className="mb-4">
        <p className="text-slate-500 dark:text-slate-500 text-xs mb-2">
          {order.items.length} sản phẩm
        </p>
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

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-500 text-xs">
        Thanh toán: <span className="text-slate-700 dark:text-slate-300">Số dư tài khoản</span>
      </p>
      <Link
        to={`/profile/orders/${order._id}`}
        className="flex items-center gap-1 text-primary hover:text-primary-light text-sm font-semibold transition-colors"
      >
        Xem chi tiết <FiArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

export default Orders;
