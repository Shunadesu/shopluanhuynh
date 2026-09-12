import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiCreditCard, FiPhone, FiCopy } from 'react-icons/fi';
import { TableSkeleton, FilterSkeleton } from '../components/SkeletonLoader';

export default function Deposits() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  // Pending counts for both tabs
  const { data: pendingCounts } = useQuery({
    queryKey: ['admin-deposits-pending-counts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/deposits/pending-count');
      return data;
    },
    refetchInterval: 30000, // Auto refresh every 30s
  });

  // Bank deposits query
  const { data: bankDepositsData, isLoading: bankLoading, refetch: refetchBank } = useQuery({
    queryKey: ['admin-deposits', 'bank', statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/admin/deposits?depositMethod=bank&';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const { data } = await api.get(url);
      return data;
    },
    enabled: activeTab === 'bank',
  });

  // Card deposits query
  const { data: cardDepositsData, isLoading: cardLoading, refetch: refetchCard } = useQuery({
    queryKey: ['admin-deposits', 'card', statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/admin/deposits?depositMethod=card&';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const { data } = await api.get(url);
      return data;
    },
    enabled: activeTab === 'card',
  });

  // Get current tab data
  const depositsData = activeTab === 'bank' ? bankDepositsData : cardDepositsData;
  const isLoading = activeTab === 'bank' ? bankLoading : cardLoading;
  const refetch = activeTab === 'bank' ? refetchBank : refetchCard;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      if (status === 'approved') {
        return api.put(`/admin/deposits/${id}/approve`);
      }
      return api.put(`/admin/deposits/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-deposits']);
      queryClient.invalidateQueries(['admin-deposits-pending-counts']);
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

  const getDepositMethodBadge = (method) => {
    const methodMap = {
      bank: { text: 'Ngân hàng', class: 'bg-blue-500/20 text-blue-400' },
      card: { text: 'Thẻ cào', class: 'bg-purple-500/20 text-purple-400' },
    };
    return methodMap[method] || methodMap.bank;
  };

  const getCardTypeName = (cardType) => {
    const cardTypeMap = {
      viettel: { name: 'Viettel', color: 'text-red-400' },
      mobifone: { name: 'Mobifone', color: 'text-blue-400' },
      vinaphone: { name: 'Vinaphone', color: 'text-purple-400' },
    };
    return cardTypeMap[cardType] || { name: cardType, color: 'text-slate-400' };
  };

  const handleUpdateStatus = (depositId, status) => {
    if (window.confirm(`Xác nhận ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu?`)) {
      updateStatusMutation.mutate({ id: depositId, status });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  return (
    <div className="space-y-4">
      {/* Header - Always visible, no skeleton */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Yêu cầu nạp tiền</h1>
        <p className="text-slate-400 mt-1">Quản lý yêu cầu nạp tiền từ người dùng</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-3">
        {/* Bank Tab */}
        <button
          onClick={() => setActiveTab('bank')}
          className={`
            flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all
            ${activeTab === 'bank'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }
          `}
        >
          <FiCreditCard className="w-5 h-5" />
          <span>Nạp Ngân hàng</span>
          {pendingCounts?.bank > 0 && (
            <span className={`
              px-2.5 py-0.5 rounded-full text-xs font-bold
              ${activeTab === 'bank' ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400'}
            `}>
              {pendingCounts.bank}
            </span>
          )}
        </button>

        {/* Card Tab */}
        <button
          onClick={() => setActiveTab('card')}
          className={`
            flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all
            ${activeTab === 'card'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }
          `}
        >
          <FiPhone className="w-5 h-5" />
          <span>Nạp Thẻ cào</span>
          {pendingCounts?.card > 0 && (
            <span className={`
              px-2.5 py-0.5 rounded-full text-xs font-bold
              ${activeTab === 'card' ? 'bg-white text-purple-600' : 'bg-purple-500/20 text-purple-400'}
            `}>
              {pendingCounts.card}
            </span>
          )}
        </button>
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
          className="input-field w-48"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2 px-4"
          title="Làm mới"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Deposits Table */}
      {isLoading ? (
        <div className="space-y-4">
          <FilterSkeleton />
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Người dùng</th>
              {activeTab === 'bank' ? (
                <>
                  <th>Ngân hàng</th>
                  <th>Nội dung CK</th>
                </>
              ) : (
                <>
                  <th>Loại thẻ</th>
                  <th>Serial</th>
                </>
              )}
              <th>Số tiền</th>
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
                      <p className="font-medium">{deposit.userId?.username}</p>
                      <p className="text-xs text-slate-400">{deposit.userId?.email || deposit.userId?.phone}</p>
                    </div>
                  </td>
                  {activeTab === 'bank' ? (
                    <>
                      <td>
                        <div>
                          <p className="font-medium">{deposit.bankAccountId?.bankName}</p>
                          <p className="text-xs text-slate-400">{deposit.bankAccountId?.accountNumber}</p>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-slate-300">
                        {deposit.transferNote || 'N/A'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <span className={`font-semibold ${getCardTypeName(deposit.cardType).color}`}>
                          {getCardTypeName(deposit.cardType).name}
                        </span>
                      </td>
                      <td className="font-mono text-sm text-slate-300">
                        {deposit.cardSerial?.substring(0, 8)}***
                      </td>
                    </>
                  )}
                  <td className="font-semibold text-cyan-400">
                    {deposit.amount?.toLocaleString('vi-VN')}đ
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
                <td colSpan="8" className="text-center text-slate-400 py-8">
                  {activeTab === 'bank' ? 'Chưa có yêu cầu nạp ngân hàng nào' : 'Chưa có yêu cầu nạp thẻ cào nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

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
                  <p><span className="text-slate-400">Tên:</span> {selectedDeposit.userId?.fullName || selectedDeposit.userId?.username}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedDeposit.userId?.email || 'N/A'}</p>
                  <p><span className="text-slate-400">SĐT:</span> {selectedDeposit.userId?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-100 mb-3">Thông tin giao dịch</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Số tiền:</span> <span className="text-cyan-400 font-semibold">{selectedDeposit.amount?.toLocaleString('vi-VN')}đ</span></p>
                  <p>
                    <span className="text-slate-400">Phương thức:</span>{' '}
                    <span className={`badge ${getDepositMethodBadge(selectedDeposit.depositMethod || 'bank').class}`}>
                      {getDepositMethodBadge(selectedDeposit.depositMethod || 'bank').text}
                    </span>
                  </p>
                  
                  {selectedDeposit.depositMethod === 'card' ? (
                    <>
                      <p>
                        <span className="text-slate-400">Loại thẻ:</span>{' '}
                        <span className={`font-semibold ${getCardTypeName(selectedDeposit.cardType).color}`}>
                          {getCardTypeName(selectedDeposit.cardType).name}
                        </span>
                      </p>
                      
                      {/* Serial với button copy */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <p className="text-slate-400 mb-1">Số serial</p>
                          <p className="font-mono text-slate-100 bg-slate-800 px-3 py-2 rounded">
                            {selectedDeposit.cardSerial}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedDeposit.cardSerial, 'serial')}
                          className="btn-secondary px-3 py-2 mt-6 shrink-0"
                          title="Copy serial"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Code với button copy */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <p className="text-slate-400 mb-1">Mã thẻ</p>
                          <p className="font-mono text-slate-100 bg-slate-800 px-3 py-2 rounded">
                            {selectedDeposit.cardCode}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedDeposit.cardCode, 'mã thẻ')}
                          className="btn-secondary px-3 py-2 mt-6 shrink-0"
                          title="Copy mã thẻ"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><span className="text-slate-400">Ngân hàng:</span> {selectedDeposit.bankAccountId?.bankName}</p>
                      <p><span className="text-slate-400">Chủ TK:</span> {selectedDeposit.bankAccountId?.accountName}</p>
                      <p><span className="text-slate-400">Số TK:</span> {selectedDeposit.bankAccountId?.accountNumber}</p>
                      <p><span className="text-slate-400">Nội dung CK:</span> {selectedDeposit.transferNote || 'N/A'}</p>
                      {selectedDeposit.transactionCode && (
                        <p><span className="text-slate-400">Mã GD:</span> {selectedDeposit.transactionCode}</p>
                      )}
                    </>
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

              {selectedDeposit.adminNote && (
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-semibold text-slate-100 mb-3">Ghi chú admin</h3>
                  <p className="text-sm text-slate-300">{selectedDeposit.adminNote}</p>
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
