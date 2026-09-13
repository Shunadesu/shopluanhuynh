import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiTag, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { PromotionsTableSkeleton } from '../components/SkeletonLoader';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Promotions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    applyType: 'all',
  });

  // Fetch promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.applyType !== 'all') params.append('applyType', filters.applyType);
      
      const { data } = await api.get(`/admin/promotions?${params}`);
      return data;
    },
  });

  // Toggle promotion mutation
  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/promotions/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
      toast.success('Đã cập nhật trạng thái');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật trạng thái');
    },
  });

  // Delete promotion mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
      toast.success('Đã xóa khuyến mãi');
    },
    onError: () => {
      toast.error('Lỗi khi xóa khuyến mãi');
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Xóa khuyến mãi "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getApplyTypeLabel = (type) => {
    const labels = {
      accounts: 'Tài khoản cụ thể',
      categories: 'Danh mục',
      subcategories: 'Danh mục con',
    };
    return labels[type] || type;
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return 'Không giới hạn';
    
    const formatDate = (date) => format(new Date(date), 'dd/MM/yyyy', { locale: vi });
    
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) {
      return `Từ ${formatDate(startDate)}`;
    }
    if (endDate) {
      return `Đến ${formatDate(endDate)}`;
    }
    return 'Không giới hạn';
  };

  if (isLoading) {
    return <PromotionsTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <FiTag className="text-cyan-400" />
            Khuyến mãi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý các chương trình khuyến mãi cho tài khoản game
          </p>
        </div>
        <button
          onClick={() => navigate('/promotions/new')}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Tạo khuyến mãi
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 bg">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="input w-44 text-black"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Đã tắt</option>
        </select>

        <select
          value={filters.applyType}
          onChange={(e) => setFilters({ ...filters, applyType: e.target.value })}
          className="input w-48 text-black"
        >
          <option value="all">Tất cả loại áp dụng</option>
          <option value="accounts">Tài khoản cụ thể</option>
          <option value="categories">Danh mục</option>
          <option value="subcategories">Danh mục con</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tên chương trình</th>
              <th className="text-center">% Giảm</th>
              <th>Áp dụng cho</th>
              <th className="text-center">Số lượng</th>
              <th>Thời gian</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!promotions || promotions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">
                  Chưa có khuyến mãi nào
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo._id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{promo.name}</span>
                      <span className="text-xs text-slate-500">
                        {promo.createdBy?.username || 'Admin'}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-bold">
                      -{promo.discountPercent}%
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-slate-300">
                      {getApplyTypeLabel(promo.applyType)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-cyan-400 font-semibold">
                      {promo.appliedCount || 0}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="text-[10px]" />
                        {formatDateRange(promo.startDate, promo.endDate)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        promo.isActive
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {promo.isActive ? 'Kích hoạt' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => toggleMutation.mutate(promo._id)}
                        className="btn-icon text-cyan-400 hover:bg-cyan-500/10"
                        title={promo.isActive ? 'Tắt' : 'Bật'}
                      >
                        {promo.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => navigate(`/promotions/edit/${promo._id}`)}
                        className="btn-icon text-slate-400 hover:bg-slate-700"
                        title="Sửa"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id, promo.name)}
                        className="btn-icon text-orange-400 hover:bg-orange-500/10"
                        title="Xóa"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {promotions && promotions.length > 0 && (
        <div className="flex justify-between items-center text-sm text-slate-400">
          <span>Tổng: {promotions.length} chương trình</span>
          <span>
            Đang kích hoạt: {promotions.filter((p) => p.isActive).length}
          </span>
        </div>
      )}
    </div>
  );
}
