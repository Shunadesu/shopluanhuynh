import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function Accounts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    rank: '',
    champions: '',
    skins: '',
    server: '',
    loginInfo: '',
    images: [],
    status: 'available',
  });

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts', selectedCategory, searchTerm],
    queryFn: async () => {
      let url = '/accounts?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Tạo tài khoản thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Cập nhật tài khoản thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Xóa tài khoản thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        title: account.title,
        category: account.category._id,
        price: account.price,
        description: account.description || '',
        rank: account.rank || '',
        champions: account.champions || '',
        skins: account.skins || '',
        server: account.server || '',
        loginInfo: account.loginInfo || '',
        images: account.images || [],
        status: account.status || 'available',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        title: '',
        category: '',
        price: '',
        description: '',
        rank: '',
        champions: '',
        skins: '',
        server: '',
        loginInfo: '',
        images: [],
        status: 'available',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Còn hàng', class: 'badge-success' },
      sold: { text: 'Đã bán', class: 'badge-danger' },
      reserved: { text: 'Đang giữ', class: 'badge-warning' },
    };
    return statusMap[status] || statusMap.available;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Tài khoản game</h1>
          <p className="text-slate-400 mt-1">Quản lý tài khoản game</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm tài khoản
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
            placeholder="Tìm kiếm tài khoản..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-64"
        >
          <option value="">Tất cả danh mục</option>
          {categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Accounts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {accountsData?.length > 0 ? (
              accountsData.map((account) => (
                <tr key={account._id}>
                  <td className="font-medium">{account.title}</td>
                  <td>{account.category?.name}</td>
                  <td className="font-semibold text-cyan-400">
                    {account.price?.toLocaleString('vi-VN')}đ
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(account.status).class}`}>
                      {getStatusBadge(account.status).text}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(account)}
                        className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-slate-400 py-4">
                  Chưa có tài khoản nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card max-w-3xl w-full my-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="available">Còn hàng</option>
                    <option value="sold">Đã bán</option>
                    <option value="reserved">Đang giữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rank
                  </label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Server
                  </label>
                  <input
                    type="text"
                    value={formData.server}
                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thông tin đăng nhập
                </label>
                <textarea
                  value={formData.loginInfo}
                  onChange={(e) => setFormData({ ...formData, loginInfo: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="Username: xxx | Password: xxx"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary">
                  {editingAccount ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
