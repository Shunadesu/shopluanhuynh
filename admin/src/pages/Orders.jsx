import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { TableSkeleton, FilterSkeleton } from '../components/SkeletonLoader';

export default function Orders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/admin/orders?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Cập nhật trạng thái thành công');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', class: 'badge-warning' },
      completed: { text: 'Hoàn thành', class: 'badge-success' },
      cancelled: { text: 'Đã hủy', class: 'badge-danger' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleUpdateStatus = (orderId, status) => {
    if (window.confirm(`Xác nhận ${status === 'completed' ? 'hoàn thành' : 'hủy'} đơn hàng?`)) {
      updateStatusMutation.mutate({ id: orderId, status });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-9 bg-slate-700 rounded w-32 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-28 mt-2 animate-pulse" />
        </div>
        
        {/* Filter Skeleton */}
        <FilterSkeleton />
        
        {/* Table Skeleton */}
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Đơn hàng</h1>
        <p className="text-slate-400 mt-1">Quản lý đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm đơn hàng..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-64"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders Table */}
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {ordersData?.orders?.length > 0 ? (
              ordersData.orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-mono text-cyan-400">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium">{order.user?.username}</p>
                      <p className="text-xs text-slate-400">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="max-w-xs">
                    <p className="font-medium truncate">{order.account?.title}</p>
                    <p className="text-xs text-slate-400">{order.account?.category?.name}</p>
                  </td>
                  <td className="font-semibold text-cyan-400">
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
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                            title="Hoàn thành"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all"
                            title="Hủy đơn"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-slate-400 py-4">
                  Chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Chi tiết đơn hàng</h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Mã đơn hàng</p>
                  <p className="font-mono text-cyan-400">
                    #{selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                  <span className={`badge ${getStatusBadge(selectedOrder.status).class}`}>
                    {getStatusBadge(selectedOrder.status).text}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-100 mb-3">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Tên:</span> {selectedOrder.user?.username}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedOrder.user?.email}</p>
                  <p><span className="text-slate-400">SĐT:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-100 mb-3">Thông tin sản phẩm</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Tên:</span> {selectedOrder.account?.title}</p>
                  <p><span className="text-slate-400">Danh mục:</span> {selectedOrder.account?.category?.name}</p>
                  <p><span className="text-slate-400">Giá:</span> {selectedOrder.price?.toLocaleString('vi-VN')}đ</p>
                  {selectedOrder.account?.loginInfo && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                      <p className="text-slate-400 mb-1">Thông tin đăng nhập:</p>
                      <p className="text-cyan-400 font-mono text-xs">
                        {selectedOrder.account.loginInfo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-400">
                  Ngày đặt: {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'completed')}
                      className="flex-1 btn-primary"
                    >
                      Hoàn thành đơn
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                      className="flex-1 btn-danger"
                    >
                      Hủy đơn
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 btn-secondary"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
