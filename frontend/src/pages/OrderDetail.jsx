import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrders';
import SEOHead from '../components/SEOHead';
import { OrderDetailSkeleton } from '../components/SkeletonLoader';
import {
  FiCheckCircle, FiClock, FiXCircle, FiCopy, FiEye, FiEyeOff,
  FiArrowLeft, FiShoppingBag, FiTag, FiServer, FiLock, FiInfo,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  completed: {
    icon: FiCheckCircle,
    label: 'Hoàn thành',
    cls: 'bg-green-500/20 text-green-400 border-green-500/40',
    bg: 'from-green-600/20 to-green-900/10',
    msg: 'Đơn hàng đã hoàn thành. Thông tin tài khoản bên dưới.',
  },
  pending: {
    icon: FiClock,
    label: 'Đang xử lý',
    cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    bg: 'from-yellow-600/20 to-yellow-900/10',
    msg: 'Đơn hàng đang được xử lý. Vui lòng chờ trong giây lát.',
  },
  processing: {
    icon: FiClock,
    label: 'Đang xử lý',
    cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    bg: 'from-yellow-600/20 to-yellow-900/10',
    msg: 'Đơn hàng đang được xử lý. Vui lòng chờ trong giây lát.',
  },
  cancelled: {
    icon: FiXCircle,
    label: 'Đã hủy',
    cls: 'bg-red-500/20 text-red-400 border-red-500/40',
    bg: 'from-red-600/20 to-red-900/10',
    msg: 'Đơn hàng đã bị hủy.',
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border text-sm font-semibold px-4 py-1.5 rounded-full ${cfg.cls}`}>
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [showPasswords, setShowPasswords] = useState({});

  const { data: order, loading: isLoading } = useOrderDetail(id);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã copy ${label}`);
    });
  };

  const togglePassword = (accountId) => {
    setShowPasswords((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  if (isLoading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="min-h-screen pt-20 pb-6">
        <div className="container-custom text-center py-20">
          <FiInfo className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-900 dark:text-white text-xl font-bold mb-2">Không tìm thấy đơn hàng</p>
          <Link to="/profile/orders" className="btn-primary inline-flex items-center gap-2 mt-4">
            <FiArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen pt-20 pb-6">
      <SEOHead
        title={`Đơn hàng #${order.orderNumber}`}
        description={`Chi tiết đơn hàng #${order.orderNumber} - Thông tin tài khoản đã mua`}
        type="website"
      />
      <div className="container-custom space-y-4">

        {/* ── Breadcrumb + Header ─────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500 mb-2">
          <Link to="/profile" className="hover:text-primary transition-colors">Hồ sơ</Link>
          <span>/</span>
          <Link to="/profile/orders" className="hover:text-primary transition-colors">Đơn hàng</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">#{order.orderNumber}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left Column ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Status Hero Card */}
            <div className={`rounded-2xl p-[2px] bg-gradient-to-br ${statusCfg.bg} border border-slate-200 dark:border-slate-800`}>
              <div className="bg-white dark:bg-dark rounded-[14px] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      order.status === 'completed' ? 'bg-green-500/20' :
                      order.status === 'cancelled' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <StatusIcon className={`w-7 h-7 ${
                        order.status === 'completed' ? 'text-green-400' :
                        order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white">#{order.orderNumber}</h1>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                {/* Status message */}
                <div className={`mt-4 p-3 rounded-xl border ${
                  order.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : order.status === 'cancelled'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  <p className="text-sm font-medium">{statusCfg.msg}</p>
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

            {/* Back link */}
            <Link
              to="/profile/orders"
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
            </Link>
          </div>

          {/* ── Right Column (Sticky Summary) ─────────────── */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiInfo className="text-primary" />
                Tóm tắt đơn hàng
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
                  <span>Số sản phẩm</span>
                  <span>{order.items?.length}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                  <span>Phương thức</span>
                  <span>Số dư TK</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-xl pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {order.totalAmount?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              {order.status === 'completed' && (
                <Link
                  to="/shop"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <FiTrendingUp className="w-4 h-4" /> Mua thêm tài khoản
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Account Item ────────────────────────────────────────────
const AccountItem = ({ item, orderStatus, showPasswords, onTogglePassword, onCopy }) => {
  const acc = item.accountId;
  const visible = showPasswords[acc._id];
  const isCompleted = orderStatus === 'completed';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-light p-5">
      {/* Product info */}
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
                <FiTag className="w-3 h-3" />
                {acc.rank}
              </span>
            )}
            {acc.server && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                <FiServer className="w-3 h-3" />
                {acc.server}
              </span>
            )}
            {acc.category && (
              <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                {acc.category.name}
              </span>
            )}
          </div>
          <p className="text-primary font-bold text-base">
            {item.price?.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Credentials — only show when completed */}
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

// ── Credential Row ──────────────────────────────────────────
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
          {visible
            ? <FiEyeOff className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            : <FiEye className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          }
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

export default OrderDetail;
