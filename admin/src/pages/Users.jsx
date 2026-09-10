import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiSearch, FiEye, FiUserCheck, FiUserX } from 'react-icons/fi';
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
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Số dư</th>
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
                  <td className="font-semibold text-cyan-400">
                    {user.balance?.toLocaleString('vi-VN')}đ
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
                <td colSpan="8" className="text-center text-slate-400 py-4">
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
                  <p className="text-sm text-slate-400 mb-1">Quyền</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {selectedUser.isAdmin ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700">
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

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleAdmin(selectedUser._id, selectedUser.isAdmin)}
                  className={selectedUser.isAdmin ? 'flex-1 btn-danger' : 'flex-1 btn-primary'}
                >
                  {selectedUser.isAdmin ? 'Gỡ quyền admin' : 'Cấp quyền admin'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
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
