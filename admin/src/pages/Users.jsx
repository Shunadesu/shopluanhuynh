import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiSearch, FiEye, FiUserCheck, FiUserX, FiDollarSign, FiEdit } from 'react-icons/fi';
import { TableSkeleton } from '../components/SkeletonLoader';

export default function Users() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let url = '/admin/users?';
      if (searchTerm) url += `search=${searchTerm}`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, isAdmin }) => api.put(`/admin/users/${id}`, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Cập nhật quyền thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // State for balance adjustment
  const [adjustMode, setAdjustMode] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');

  // State for inline balance editing
  const [inlineEditUser, setInlineEditUser] = useState(null);
  const [inlineEditAmount, setInlineEditAmount] = useState('');

  const adjustBalanceMutation = useMutation({
    mutationFn: ({ id, amount, action }) =>
      api.put(`/admin/users/${id}/adjust-balance`, { amount, action }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['admin-users']);
      setSelectedUser(response.data.user);
      setAdjustMode(false);
      setAdjustAmount('');
      toast.success('Đã điều chỉnh số dư thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const inlineAdjustMutation = useMutation({
    mutationFn: ({ id, amount }) =>
      api.put(`/admin/users/${id}/adjust-balance`, {
        amount: parseInt(amount),
        action: 'set'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setInlineEditUser(null);
      setInlineEditAmount('');
      toast.success('Đã cập nhật số dư');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Open inline edit for a user
  const openInlineEdit = (user, e) => {
    e.stopPropagation();
    setInlineEditUser(user);
    setInlineEditAmount('');
  };

  // Handle inline balance adjustment (set directly)
  const handleInlineAdjust = (user) => {
    const amount = parseInt(inlineEditAmount);
    if (inlineEditAmount === '' || isNaN(amount) || amount < 0) {
      toast.error('Nhập số dư hợp lệ (≥ 0)');
      return;
    }
    inlineAdjustMutation.mutate({ id: user._id, amount });
  };

  // Close inline edit when clicking outside
  const inlineEditRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inlineEditRef.current && !inlineEditRef.current.contains(event.target)) {
        setInlineEditUser(null);
      }
    };
    if (inlineEditUser) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inlineEditUser]);

  const handleToggleAdmin = (userId, currentStatus) => {
    if (window.confirm(`Xác nhận ${currentStatus ? 'gỡ' : 'cấp'} quyền admin?`)) {
      toggleAdminMutation.mutate({ id: userId, isAdmin: !currentStatus });
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
        
        {/* Search Skeleton */}
        <div className="h-10 bg-slate-800 rounded-lg w-full max-w-md animate-pulse" />
        
        {/* Table Skeleton */}
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Người dùng</h1>
        <p className="text-slate-400 mt-1">Quản lý người dùng</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="input-field pl-11"
        />
      </div>

      {/* Users Table */}
      <div className="table-container" ref={inlineEditRef}>
        <table className="table">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Số dư</th>
              <th>Tổng nạp</th>
              <th>Lượt quay</th>
              <th>Số acc đã mua</th>
              <th>Quyền</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {usersData?.users?.length > 0 ? (
              usersData.users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.username}</td>
                  <td className="text-slate-400">{user.fullName || 'N/A'}</td>
                  <td className="text-slate-400">{user.phone || 'Chưa cập nhật'}</td>
                  <td className="relative font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      <span>{user.balance?.toLocaleString('vi-VN')}đ</span>
                      <button
                        onClick={(e) => openInlineEdit(user, e)}
                        className="p-1 hover:bg-cyan-500/30 text-cyan-400 rounded transition-all"
                        title="Sửa số dư"
                      >
                        <FiEdit size={14} />
                      </button>
                    </div>
                    {/* Inline Edit Popover */}
                    {inlineEditUser?._id === user._id && (
                      <div
                        className="absolute z-50 mt-2 p-4 bg-slate-800 border border-cyan-500/50 rounded-xl shadow-2xl w-72"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-cyan-400 flex items-center gap-2">
                            <FiDollarSign /> Sửa số dư
                          </span>
                          <button
                            onClick={() => setInlineEditUser(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-sm text-slate-400 mb-2">
                          Số dư hiện tại: <span className="text-cyan-400 font-semibold">{user.balance?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          Nhập số dư mới → số dư sẽ thành đúng số đó
                        </div>
                        <input
                          type="number"
                          value={inlineEditAmount}
                          onChange={(e) => setInlineEditAmount(e.target.value)}
                          placeholder="Nhập số dư mới..."
                          min="0"
                          step="1000"
                          className="input-field w-full mb-3 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && inlineEditAmount !== '' && parseInt(inlineEditAmount) >= 0) {
                              handleInlineAdjust(user);
                            }
                          }}
                        />
                        {inlineEditAmount !== '' && parseInt(inlineEditAmount) >= 0 && (
                          <div className="text-sm text-slate-400 mb-3 p-2 bg-slate-700/50 rounded">
                            Số dư mới: <span className="font-bold text-cyan-400">
                              {parseInt(inlineEditAmount).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setInlineEditUser(null)}
                            className="flex-1 py-2 px-3 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleInlineAdjust(user)}
                            disabled={inlineAdjustMutation.isPending}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all bg-cyan-500 hover:bg-cyan-600 text-white ${
                              inlineAdjustMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {inlineAdjustMutation.isPending ? '...' : 'Xác nhận'}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="font-semibold text-purple-400">
                    {(user.totalDeposited || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full font-semibold text-sm">
                      🎡 {user.spins || 0}
                    </span>
                  </td>
                  <td>
                    <span className="text-cyan-400 font-semibold">
                      {user.purchasedAccountsCount || 0}
                    </span>
                  </td>
                  <td>
                    {user.isAdmin ? (
                      <span className="badge badge-success">Admin</span>
                    ) : (
                      <span className="badge badge-info">User</span>
                    )}
                  </td>
                  <td className="text-slate-400 text-sm">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                        className={`p-2 rounded-lg transition-all ${
                          user.isAdmin
                            ? 'hover:bg-orange-500/20 text-orange-400'
                            : 'hover:bg-green-500/20 text-green-400'
                        }`}
                        title={user.isAdmin ? 'Gỡ quyền admin' : 'Cấp quyền admin'}
                      >
                        {user.isAdmin ? <FiUserX /> : <FiUserCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-slate-400 py-4">
                  Chưa có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Thông tin người dùng</h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-2xl">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedUser.username}</h3>
                  <p className="text-slate-400">{selectedUser.fullName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="card bg-cyan-500/10 border-cyan-500/30">
                  <p className="text-sm text-slate-400 mb-1">Số dư tài khoản</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {selectedUser.balance?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="card bg-purple-500/10 border-purple-500/30">
                  <p className="text-sm text-slate-400 mb-1">Tổng đã nạp</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {(selectedUser.totalDeposited || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="card bg-orange-500/10 border-orange-500/30">
                  <p className="text-sm text-slate-400 mb-1">Lượt quay còn lại</p>
                  <p className="text-2xl font-bold text-orange-400">
                    🎡 {selectedUser.spins || 0}
                  </p>
                </div>
                <div className="card bg-green-500/10 border-green-500/30">
                  <p className="text-sm text-slate-400 mb-1">Acc đã mua</p>
                  <p className="text-2xl font-bold text-green-400">
                    {selectedUser.purchasedAccountsCount || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700">
                <div>
                  <p className="text-sm text-slate-400">Quyền</p>
                  <p className="text-slate-100">
                    {selectedUser.isAdmin ? (
                      <span className="badge badge-success">Admin</span>
                    ) : (
                      <span className="badge badge-info">User</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Số điện thoại</p>
                  <p className="text-slate-100">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Ngày đăng ký</p>
                  <p className="text-slate-100">
                    {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                  </p>
                </div>
                {selectedUser.lastLogin && (
                  <div>
                    <p className="text-sm text-slate-400">Đăng nhập gần nhất</p>
                    <p className="text-slate-100">
                      {format(new Date(selectedUser.lastLogin), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                    </p>
                  </div>
                )}
              </div>

              {/* Balance Adjustment Section */}
              {adjustMode ? (
                <div className="card bg-slate-800/50 border border-cyan-500/30 mt-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <FiDollarSign />
                    Đặt số dư
                  </h3>

                  {/* Current Balance */}
                  <div className="mb-4">
                    <p className="text-sm text-slate-400">Số dư hiện tại</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {(selectedUser.balance || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-4">
                    <label className="text-sm text-slate-400 block mb-2">
                      Số dư mới (VND)
                    </label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="Nhập số dư mới..."
                      min="0"
                      step="1000"
                      className="input-field w-full"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Nhập số dư mới → số dư sẽ được đặt thành đúng số đó
                    </p>
                  </div>

                  {/* New Balance Preview */}
                  {adjustAmount !== '' && parseInt(adjustAmount) >= 0 && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-400">Số dư sẽ thành</p>
                      <p className="text-xl font-bold text-cyan-400">
                        {parseInt(adjustAmount).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAdjustMode(false);
                        setAdjustAmount('');
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        const amount = parseInt(adjustAmount);
                        if (adjustAmount === '' || isNaN(amount) || amount < 0) {
                          toast.error('Vui lòng nhập số dư hợp lệ (≥ 0)');
                          return;
                        }
                        adjustBalanceMutation.mutate({
                          id: selectedUser._id,
                          amount,
                          action: 'set'
                        });
                      }}
                      disabled={adjustBalanceMutation.isPending}
                      className="flex-1 btn-primary"
                    >
                      {adjustBalanceMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdjustMode(true)}
                  className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
                >
                  <FiDollarSign />
                  Đặt số dư
                </button>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleAdmin(selectedUser._id, selectedUser.isAdmin)}
                  className={selectedUser.isAdmin ? 'flex-1 btn-danger' : 'flex-1 btn-primary'}
                >
                  {selectedUser.isAdmin ? 'Gỡ quyền admin' : 'Cấp quyền admin'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setAdjustMode(false);
                    setAdjustAmount('');
                  }}
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
