import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { TableSkeleton, FilterSkeleton } from '../components/SkeletonLoader';

export default function Deposits() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  const { data: depositsData, isLoading } = useQuery({
    queryKey: ['admin-deposits', statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/admin/deposits?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/deposits/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-deposits']);
      toast.success('Cập nhật trạng thái thành công');
      setSelectedDeposit(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ duyệt', class: 'badge-warning' },
      approved: { text: 'Đã duyệt', class: 'badge-success' },
      rejected: { text: 'Từ chối', class: 'badge-danger' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleUpdateStatus = (depositId, status) => {
    if (window.confirm(`Xác nhận ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu?`)) {
      updateStatusMutation.mutate({ id: depositId, status });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-9 bg-slate-700 rounded w-52 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
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
        <h1 className="text-3xl font-bold text-slate-100">Yêu cầu nạp tiền</h1>
        <p className="text-slate-400 mt-1">Quản lý yêu cầu nạp tiền</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm yêu cầu..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-64"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Người dùng</th>
              <th>Số tiền</th>
              <th>Ngân hàng</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {depositsData?.deposits?.length > 0 ? (
              depositsData.deposits.map((deposit) => (
                <tr key={deposit._id}>
                  <td className="font-mono text-cyan-400">
                    #{deposit._id.slice(-8).toUpperCase()}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium">{deposit.user?.username}</p>
                      <p className="text-xs text-slate-400">{deposit.user?.email}</p>
                    </div>
                  </td>
                  <td className="font-semibold text-cyan-400">
                    {deposit.amount?.toLocaleString('vi-VN')}đ
                  </td>
                  <td>
                    <p className="font-medium">{deposit.bankAccount?.bankName}</p>
                    <p className="text-xs text-slate-400">{deposit.bankAccount?.accountNumber}</p>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(deposit.status).class}`}>
                      {getStatusBadge(deposit.status).text}
                    </span>
                  </td>
                  <td className="text-slate-400 text-sm">
                    {format(new Date(deposit.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDeposit(deposit)}
                        className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(deposit._id, 'approved')}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                            title="Duyệt"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(deposit._id, 'rejected')}
                            className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all"
                            title="Từ chối"
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
                  Chưa có yêu cầu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Chi tiết yêu cầu nạp tiền</h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Mã giao dịch</p>
                  <p className="font-mono text-cyan-400">
                    #{selectedDeposit._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                  <span className={`badge ${getStatusBadge(selectedDeposit.status).class}`}>
                    {getStatusBadge(selectedDeposit.status).text}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-100 mb-3">Thông tin người dùng</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Tên:</span> {selectedDeposit.user?.username}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedDeposit.user?.email}</p>
                  <p><span className="text-slate-400">SĐT:</span> {selectedDeposit.user?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-100 mb-3">Thông tin giao dịch</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Số tiền:</span> <span className="text-cyan-400 font-semibold">{selectedDeposit.amount?.toLocaleString('vi-VN')}đ</span></p>
                  <p><span className="text-slate-400">Ngân hàng:</span> {selectedDeposit.bankAccount?.bankName}</p>
                  <p><span className="text-slate-400">Chủ TK:</span> {selectedDeposit.bankAccount?.accountName}</p>
                  <p><span className="text-slate-400">Số TK:</span> {selectedDeposit.bankAccount?.accountNumber}</p>
                  {selectedDeposit.transactionCode && (
                    <p><span className="text-slate-400">Mã GD:</span> {selectedDeposit.transactionCode}</p>
                  )}
                </div>
              </div>

              {selectedDeposit.proofImage && (
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-semibold text-slate-100 mb-3">Ảnh xác nhận</h3>
                  <img
                    src={selectedDeposit.proofImage}
                    alt="Proof"
                    className="w-full rounded-lg border border-slate-700"
                  />
                </div>
              )}

              <div className="border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-400">
                  Ngày tạo: {format(new Date(selectedDeposit.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedDeposit.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedDeposit._id, 'approved')}
                      className="flex-1 btn-primary"
                    >
                      Duyệt yêu cầu
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedDeposit._id, 'rejected')}
                      className="flex-1 btn-danger"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedDeposit(null)}
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
