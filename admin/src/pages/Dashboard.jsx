import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  FiShoppingBag, FiShoppingCart, FiDollarSign, FiUsers, 
  FiTrendingUp, FiClock, FiCheckCircle, FiXCircle,
  FiPackage
} from 'react-icons/fi';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { StatsSkeleton, OrderTableSkeleton, QuickStatsSkeleton } from '../components/SkeletonLoader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

export default function Dashboard() {
  // Stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  // Recent orders query
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/recent-orders');
      return data;
    },
  });

  // Revenue chart data
  const { data: revenueChartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/revenue-chart?days=7');
      return data;
    },
  });

  // Orders by status chart data
  const { data: ordersByStatus } = useQuery({
    queryKey: ['orders-by-status'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  // Stat cards config
  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('vi-VN')}đ` : '0đ',
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
      value: stats?.availableAccounts || 0,
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

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', class: 'badge-warning' },
      completed: { text: 'Hoàn thành', class: 'badge-success' },
      cancelled: { text: 'Đã hủy', class: 'badge-danger' },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Prepare pie chart data for orders by status
  const ordersStatusData = ordersByStatus ? [
    { name: 'Hoàn thành', value: ordersByStatus.completedOrders || 0, color: '#22c55e' },
    { name: 'Chờ xử lý', value: ordersByStatus.pendingOrders || 0, color: '#f59e0b' },
    { name: 'Đã hủy', value: ordersByStatus.cancelledOrders || 0, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  // Format revenue chart data for display
  const formattedRevenueData = revenueChartData?.map(item => ({
    date: format(new Date(item._id), 'dd/MM'),
    doanhThu: item.revenue,
    donHang: item.orders
  })) || [];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-32 mt-2 animate-pulse" />
        </div>
        <StatsSkeleton />
        <div className="card">
          <div className="h-6 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
          <OrderTableSkeleton rows={5} />
        </div>
        <QuickStatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FiTrendingUp className="text-cyan-400" />
              Doanh thu 7 ngày gần đây
            </h2>
          </div>
          <div className="h-64">
            {formattedRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="doanhThu" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FiPackage className="text-purple-400" />
              Đơn hàng theo trạng thái
            </h2>
          </div>
          <div className="h-64">
            {ordersStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ordersStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Chưa có đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Chart - Bar Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiShoppingCart className="text-amber-400" />
            Số đơn hàng theo ngày
          </h2>
        </div>
        <div className="h-64">
          {formattedRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}
                  formatter={(value, name) => [value, name === 'donHang' ? 'Đơn hàng' : value]}
                />
                <Bar 
                  dataKey="donHang" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Đơn hàng"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Chưa có dữ liệu đơn hàng
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiTrendingUp className="text-cyan-400" />
            Đơn hàng gần đây
          </h2>
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
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-cyan-400">
                      #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      {order.userId ? (
                        <div>
                          <div className="font-medium">{order.userId.username || order.userId.fullName || 'N/A'}</div>
                          <div className="text-xs text-slate-400">{order.userId.email || ''}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="max-w-xs truncate">
                      {order.items && order.items.length > 0 && order.items[0].accountId ? (
                        <div>
                          {typeof order.items[0].accountId === 'object' ? (
                            <span className="font-medium">{order.items[0].accountId.title || 'N/A'}</span>
                          ) : (
                            <span>ID: {order.items[0].accountId}</span>
                          )}
                          {order.items.length > 1 && (
                            <span className="text-slate-400 ml-1">+{order.items.length - 1}</span>
                          )}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="font-semibold text-cyan-400">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
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
                  <td colSpan="6" className="text-center text-slate-400 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FiShoppingCart className="text-3xl text-slate-600" />
                      <span>Chưa có đơn hàng nào</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-cyan-500/10 border-cyan-500/30">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
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
