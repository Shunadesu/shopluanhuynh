import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  FiShoppingBag, FiShoppingCart, FiDollarSign, FiUsers, 
  FiTrendingUp, FiClock, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { StatsSkeleton, OrderTableSkeleton, QuickStatsSkeleton } from '../components/SkeletonLoader';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders?limit=5');
      return data;
    },
  });

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: stats?.revenue ? `${stats.revenue.toLocaleString('vi-VN')}đ` : '0đ',
      icon: FiDollarSign,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
    },
    {
      title: 'Đơn hàng',
      value: stats?.totalOrders || 0,
      icon: FiShoppingCart,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      title: 'Tài khoản game',
      value: stats?.totalAccounts || 0,
      icon: FiShoppingBag,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
    },
    {
      title: 'Người dùng',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
    },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', class: 'badge-warning' },
      completed: { text: 'Hoàn thành', class: 'badge-success' },
      cancelled: { text: 'Đã hủy', class: 'badge-danger' },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-32 mt-2 animate-pulse" />
        </div>
        
        {/* Stats Skeleton */}
        <StatsSkeleton />
        
        {/* Recent Orders Skeleton */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-700 rounded w-40 animate-pulse" />
            <div className="h-6 bg-slate-700 rounded w-6 animate-pulse" />
          </div>
          <OrderTableSkeleton rows={5} />
        </div>
        
        {/* Quick Stats Skeleton */}
        <QuickStatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`card ${stat.bgColor} border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-xl ${stat.borderColor} border`}>
                <stat.icon className={`text-2xl ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-100">Đơn hàng gần đây</h2>
          <FiTrendingUp className="text-cyan-400 text-xl" />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.orders?.length > 0 ? (
                recentOrders.orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-cyan-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td>{order.user?.username || 'N/A'}</td>
                    <td className="max-w-xs truncate">
                      {order.account?.title || 'N/A'}
                    </td>
                    <td className="font-semibold">
                      {order.price?.toLocaleString('vi-VN')}đ
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status).class}`}>
                        {getStatusBadge(order.status).text}
                      </span>
                    </td>
                    <td className="text-slate-400 text-sm">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-slate-400 py-4">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="card bg-cyan-500/10 border-cyan-500/30">
          <div className="flex items-center gap-2">
            <FiClock className="text-3xl text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-cyan-400">
                {stats?.pendingOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-3xl text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Đơn hoàn thành</p>
              <p className="text-2xl font-bold text-green-400">
                {stats?.completedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-2">
            <FiXCircle className="text-3xl text-red-400" />
            <div>
              <p className="text-sm text-slate-400">Đơn đã hủy</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.cancelledOrders || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
