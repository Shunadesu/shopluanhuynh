import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  FiDollarSign,
  FiUser,
  FiTrendingUp,
  FiShoppingBag,
  FiKey,
  FiClock,
  FiCreditCard,
  FiPhone,
} from 'react-icons/fi';
import { GiSpinningBlades } from 'react-icons/gi';

const MENU_ITEMS = [

  {
    key: 'profile',
    label: 'Trang tài khoản',
    path: '/profile',
    icon: FiUser,
  },
  {
    key: 'spin',
    label: 'Vòng quay may mắn',
    path: '/spin',
    icon: GiSpinningBlades,
    highlight: true,
  },
  {
    key: 'spin-history',
    label: 'Lịch sử vòng quay',
    path: '/spin/history',
    icon: FiClock,
  },
  {
    key: 'policies',
    label: 'Dashboard',
    path: '/profile?view=policies',
    icon: FiTrendingUp,
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    path: '/profile?view=orders',
    icon: FiShoppingBag,
  },
  {
    key: 'purchased',
    label: 'Tài khoản đã mua',
    path: '/profile?view=purchased-accounts',
    icon: FiKey,
  },
  {
    key: 'deposits',
    label: 'Lịch sử giao dịch',
    path: '/profile?view=deposits',
    icon: FiClock,
  },
  {
    key: 'deposit-bank',
    label: 'Nạp bằng ngân hàng',
    path: '/profile?view=deposit',
    icon: FiCreditCard,
    highlight: true,
  },
  {
    key: 'deposit-card',
    label: 'Nạp bằng thẻ cào',
    path: '/profile?view=card-deposit',
    icon: FiPhone,
    highlight: true,
  },
];

export default function AccountSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const isOnProfile = location.pathname === '/profile';
  const isOnSpin = location.pathname === '/spin';
  const isOnSpinHistory = location.pathname === '/spin/history';
  const isDepositView = isOnProfile && viewParam === 'deposit';
  const isCardDepositView = isOnProfile && viewParam === 'card-deposit';
  const isOrdersView = isOnProfile && viewParam === 'orders';
  const isOrderDetailView = isOnProfile && viewParam === 'order-detail';
  const isPurchasedView = isOnProfile && viewParam === 'purchased-accounts';
  const isDepositsView = isOnProfile && viewParam === 'deposits';

  const isActive = (item) => {
    if (item.disabled) return false;
    if (item.key === 'profile') {
      return isOnProfile && !viewParam;
    }
    if (item.key === 'spin') {
      return isOnSpin;
    }
    if (item.key === 'spin-history') {
      return isOnSpinHistory;
    }
    if (item.key === 'deposit-bank') {
      return isDepositView;
    }
    if (item.key === 'deposit-card') {
      return isCardDepositView;
    }
    if (item.key === 'orders' || item.key === 'order-detail') {
      return isOrdersView || isOrderDetailView;
    }
    if (item.key === 'purchased') {
      return isPurchasedView;
    }
    if (item.key === 'deposits') {
      return isDepositsView;
    }
    return false;
  };

  const renderItem = (item, isMobile = false) => {
    const Icon = item.icon;
    const active = isActive(item);
    const baseClass = isMobile
      ? 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium';

    if (item.disabled) {
      return (
        <div
          key={item.key}
          className={`${baseClass} ${
            isMobile
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
          title="Tính năng đang phát triển"
        >
          <Icon className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 shrink-0'} />
          <span className={isMobile ? '' : 'flex-1'}>{item.label}</span>
          {!isMobile && item.badge && (
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
              {item.badge}
            </span>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        to={item.path}
        className={`${baseClass} ${
          isMobile
            ? active
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            : active
              ? item.highlight
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-primary/10 text-primary border border-primary/20'
              : item.highlight
                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-primary/40'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Icon className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 shrink-0'} />
        <span className={isMobile ? '' : 'flex-1'}>{item.label}</span>
        {!isMobile && active && !item.highlight && (
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      {/* Desktop: vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-1 card p-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
          Khu vực tài khoản
        </h3>
        {MENU_ITEMS.map((item) => renderItem(item, false))}
      </nav>

      {/* Mobile: horizontal scroll */}
      <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-thin">
        {MENU_ITEMS.map((item) => renderItem(item, true))}
      </nav>
    </aside>
  );
}
