import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiCreditCard,
  FiPackage,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiPhone,
  FiFileText,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import { useOrders } from '../hooks/useOrders';
import { useMyDepositRequests } from '../hooks/useDeposits';

export default function PoliciesSection({ user }) {
  const { data: orders = [] } = useOrders();
  const { data: deposits = [] } = useMyDepositRequests();

  // Calculate statistics
  const stats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const approvedDeposits = deposits.filter((d) => d.status === 'approved');
    const pendingDeposits = deposits.filter((d) => d.status === 'pending');

    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDeposited = approvedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const balance = user?.balance || 0;

    // Deposit methods breakdown
    const bankDeposits = approvedDeposits.filter((d) => d.depositMethod === 'bank').length;
    const cardDeposits = approvedDeposits.filter((d) => d.depositMethod === 'card').length;

    // Category breakdown (from completed orders)
    const categoryMap = {};
    completedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.accountId?.category) {
          const catName = item.accountId.category.name || 'Khác';
          categoryMap[catName] = (categoryMap[catName] || 0) + 1;
        }
      });
    });

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      totalSpent,
      totalDeposited,
      balance,
      netBalance: totalDeposited - totalSpent,
      bankDeposits,
      cardDeposits,
      totalDeposits: approvedDeposits.length,
      pendingDeposits: pendingDeposits.length,
      categories: Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [orders, deposits, user]);

  return (
    <>
      {/* Hero Section */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shrink-0">
              <FiTrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Dashboard & Thống kê</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Xem insights về hoạt động và chi tiêu của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FiShoppingBag}
          label="Tổng đơn hàng"
          value={stats.totalOrders}
          subtext={`${stats.completedOrders} hoàn thành`}
          color="blue"
        />
        <StatCard
          icon={FiDollarSign}
          label="Đã chi tiêu"
          value={stats.totalSpent >= 1000000 ? `${(stats.totalSpent / 1000000).toFixed(1)}M` : `${(stats.totalSpent / 1000).toFixed(0)}k`}
          subtext={`${stats.totalSpent.toLocaleString('vi-VN')}đ`}
          color="red"
        />
        <StatCard
          icon={FiCreditCard}
          label="Đã nạp tiền"
          value={stats.totalDeposited >= 1000000 ? `${(stats.totalDeposited / 1000000).toFixed(1)}M` : `${(stats.totalDeposited / 1000).toFixed(0)}k`}
          subtext={`${stats.totalDeposits} giao dịch`}
          color="green"
        />
        <StatCard
          icon={FiActivity}
          label="Số dư hiện tại"
          value={stats.balance >= 1000000 ? `${(stats.balance / 1000000).toFixed(1)}M` : `${(stats.balance / 1000).toFixed(0)}k`}
          subtext={stats.netBalance >= 0 ? `+${stats.netBalance.toLocaleString('vi-VN')}đ` : `${stats.netBalance.toLocaleString('vi-VN')}đ`}
          color="purple"
        />
      </div>

      {/* Financial Overview */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="text-primary" />
          Tổng quan tài chính
        </h2>
        <div className="space-y-4">
          <FinancialBar
            label="Tổng nạp"
            value={stats.totalDeposited}
            maxValue={Math.max(stats.totalDeposited, stats.totalSpent)}
            color="bg-green-500"
            icon={FiArrowUp}
          />
          <FinancialBar
            label="Tổng chi"
            value={stats.totalSpent}
            maxValue={Math.max(stats.totalDeposited, stats.totalSpent)}
            color="bg-red-500"
            icon={FiArrowDown}
          />
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chênh lệch</span>
              <span
                className={`text-lg font-black ${
                  stats.netBalance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stats.netBalance >= 0 ? '+' : ''}
                {stats.netBalance.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Breakdown */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiPackage className="text-blue-500" />
            Phân tích đơn hàng
          </h3>
          <div className="space-y-3">
            <StatusRow
              icon={FiCheckCircle}
              label="Hoàn thành"
              value={stats.completedOrders}
              total={stats.totalOrders}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
            <StatusRow
              icon={FiClock}
              label="Đang xử lý"
              value={stats.pendingOrders}
              total={stats.totalOrders}
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
            />
            <StatusRow
              icon={FiXCircle}
              label="Đã hủy"
              value={stats.totalOrders - stats.completedOrders - stats.pendingOrders}
              total={stats.totalOrders}
              color="text-red-500"
              bgColor="bg-red-500/10"
            />
          </div>
        </div>

        {/* Deposit Methods */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCreditCard className="text-purple-500" />
            Phương thức nạp tiền
          </h3>
          <div className="space-y-3">
            <StatusRow
              icon={FiCreditCard}
              label="Ngân hàng"
              value={stats.bankDeposits}
              total={stats.totalDeposits}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <StatusRow
              icon={FiPhone}
              label="Thẻ cào"
              value={stats.cardDeposits}
              total={stats.totalDeposits}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
            {stats.pendingDeposits > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  <FiClock className="inline w-3 h-3 mr-1" />
                  {stats.pendingDeposits} yêu cầu đang chờ duyệt
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {stats.categories.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FiAward className="text-primary" />
            Top 5 danh mục yêu thích
          </h3>
          <div className="space-y-2">
            {stats.categories.map(([category, count], idx) => (
              <div
                key={category}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm">{category}</p>
                </div>
                <span className="text-primary font-bold text-sm">{count} tài khoản</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PolicyLink
          icon={FiFileText}
          title="Điều khoản sử dụng"
          description="Quy định và điều khoản"
          to="/terms"
          color="blue"
        />
        <PolicyLink
          icon={FiShield}
          title="Chính sách bảo mật"
          description="Bảo vệ thông tin cá nhân"
          to="/privacy"
          color="green"
        />
        <PolicyLink
          icon={FiActivity}
          title="Hướng dẫn sử dụng"
          description="Cách thức mua và nạp tiền"
          to="/guide"
          color="purple"
        />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Sub Components
// ═══════════════════════════════════════════════════════════

const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colorMap = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-primary',
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5">{label}</p>
          <p className="text-slate-900 dark:text-white font-black text-xl leading-tight">{value}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate">{subtext}</p>
        </div>
      </div>
    </div>
  );
};

const FinancialBar = ({ label, value, maxValue, color, icon: Icon }) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </span>
        <span className="text-slate-900 dark:text-white font-bold">{value.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};

const StatusRow = ({ icon: Icon, label, value, total, color, bgColor }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</span>
          <span className="text-slate-900 dark:text-white font-bold text-sm">{value}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.replace('text-', 'bg-')} rounded-full transition-all duration-500`} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

const PolicyLink = ({ icon: Icon, title, description, to, color }) => {
  const colorMap = {
    blue: 'from-blue-600 to-blue-500',
    green: 'from-green-600 to-green-500',
    purple: 'from-purple-600 to-purple-500',
  };

  return (
    <Link
      to={to}
      className="card hover:border-primary/50 transition-all group text-center p-5"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">{title}</h4>
      <p className="text-slate-500 dark:text-slate-400 text-xs">{description}</p>
    </Link>
  );
};
