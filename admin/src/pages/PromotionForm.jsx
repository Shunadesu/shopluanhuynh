import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave, FiTag } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Select from 'react-select';

export default function PromotionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    discountPercent: 0,
    isActive: true,
    applyType: 'accounts',
    accountIds: [],
    categoryIds: [],
    subcategoryIds: [],
    startDate: '',
    endDate: '',
  });

  // Fetch promotion data if editing
  const { data: promotion } = useQuery({
    queryKey: ['promotion', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/promotions/${id}`);
      return data;
    },
    enabled: isEdit,
  });

  // Fetch accounts for selection
  const { data: accounts } = useQuery({
    queryKey: ['accounts-all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/accounts?limit=1000');
      return data.accounts || [];
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data.filter(cat => !cat.parentId); // Only parent categories
    },
  });

  // Fetch subcategories
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories-all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data.filter(cat => cat.parentId); // Only subcategories
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || '',
        discountPercent: promotion.discountPercent || 0,
        isActive: promotion.isActive !== false,
        applyType: promotion.applyType || 'accounts',
        accountIds: promotion.accountIds?.map(acc => acc._id || acc) || [],
        categoryIds: promotion.categoryIds?.map(cat => cat._id || cat) || [],
        subcategoryIds: promotion.subcategoryIds?.map(sub => sub._id || sub) || [],
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [promotion]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return api.put(`/admin/promotions/${id}`, data);
      }
      return api.post('/admin/promotions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
      toast.success(isEdit ? 'Đã cập nhật khuyến mãi' : 'Đã tạo khuyến mãi');
      navigate('/promotions');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chương trình');
      return;
    }

    if (formData.discountPercent <= 0 || formData.discountPercent > 100) {
      toast.error('% giảm giá phải từ 1-100');
      return;
    }

    // Check selected items
    if (formData.applyType === 'accounts' && formData.accountIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 tài khoản');
      return;
    }
    if (formData.applyType === 'categories' && formData.categoryIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục');
      return;
    }
    if (formData.applyType === 'subcategories' && formData.subcategoryIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục con');
      return;
    }

    // Convert dates
    const submitData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    saveMutation.mutate(submitData);
  };

  // Prepare options for react-select
  const accountOptions = accounts?.map(acc => ({
    value: acc._id,
    label: `${acc.code || acc._id} - ${acc.title}`,
  })) || [];

  const categoryOptions = categories?.map(cat => ({
    value: cat._id,
    label: cat.name,
  })) || [];

  const subcategoryOptions = subcategories?.map(sub => ({
    value: sub._id,
    label: `${sub.name} (${sub.parentId?.name || 'N/A'})`,
  })) || [];

  // Custom styles for react-select (dark theme)
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      '&:hover': {
        borderColor: '#475569',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#334155' : '#1E293B',
      color: '#F8FAFC',
      '&:hover': {
        backgroundColor: '#334155',
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#22D3EE20',
      border: '1px solid #22D3EE30',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#22D3EE',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#22D3EE',
      '&:hover': {
        backgroundColor: '#22D3EE40',
        color: '#F8FAFC',
      },
    }),
    input: (base) => ({
      ...base,
      color: '#F8FAFC',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#F8FAFC',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#64748B',
    }),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/promotions')}
          className="btn-icon text-slate-400 hover:bg-slate-800"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <FiTag className="text-cyan-400" />
            {isEdit ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isEdit ? 'Cập nhật thông tin chương trình khuyến mãi' : 'Thêm chương trình khuyến mãi mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Tên chương trình *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="VD: Khuyến mãi Tết 2024"
              required
            />
          </div>

          <div>
            <label className="label">% Giảm giá *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
              className="input"
              placeholder="0"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Từ 1-100%</p>
          </div>

          <div>
            <label className="label">Trạng thái</label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="input"
            >
              <option value="true">Kích hoạt</option>
              <option value="false">Tắt</option>
            </select>
          </div>
        </div>

        {/* Apply Type */}
        <div>
          <label className="label">Áp dụng cho *</label>
          <select
            value={formData.applyType}
            onChange={(e) => setFormData({ 
              ...formData, 
              applyType: e.target.value,
              // Reset selections
              accountIds: [],
              categoryIds: [],
              subcategoryIds: [],
            })}
            className="input"
          >
            <option value="accounts">Tài khoản cụ thể</option>
            <option value="categories">Danh mục</option>
            <option value="subcategories">Danh mục con</option>
          </select>
        </div>

        {/* Multi-select based on applyType */}
        {formData.applyType === 'accounts' && (
          <div>
            <label className="label">Chọn tài khoản *</label>
            <Select
              isMulti
              options={accountOptions}
              value={accountOptions.filter(opt => formData.accountIds.includes(opt.value))}
              onChange={(selected) => setFormData({ 
                ...formData, 
                accountIds: selected.map(s => s.value) 
              })}
              styles={selectStyles}
              placeholder="Chọn tài khoản..."
              noOptionsMessage={() => 'Không tìm thấy tài khoản'}
            />
            <p className="text-xs text-slate-500 mt-1">
              Đã chọn: {formData.accountIds.length} tài khoản
            </p>
          </div>
        )}

        {formData.applyType === 'categories' && (
          <div>
            <label className="label">Chọn danh mục *</label>
            <Select
              isMulti
              options={categoryOptions}
              value={categoryOptions.filter(opt => formData.categoryIds.includes(opt.value))}
              onChange={(selected) => setFormData({ 
                ...formData, 
                categoryIds: selected.map(s => s.value) 
              })}
              styles={selectStyles}
              placeholder="Chọn danh mục..."
              noOptionsMessage={() => 'Không tìm thấy danh mục'}
            />
            <p className="text-xs text-slate-500 mt-1">
              Đã chọn: {formData.categoryIds.length} danh mục
            </p>
          </div>
        )}

        {formData.applyType === 'subcategories' && (
          <div>
            <label className="label">Chọn danh mục con *</label>
            <Select
              isMulti
              options={subcategoryOptions}
              value={subcategoryOptions.filter(opt => formData.subcategoryIds.includes(opt.value))}
              onChange={(selected) => setFormData({ 
                ...formData, 
                subcategoryIds: selected.map(s => s.value) 
              })}
              styles={selectStyles}
              placeholder="Chọn danh mục con..."
              noOptionsMessage={() => 'Không tìm thấy danh mục con'}
            />
            <p className="text-xs text-slate-500 mt-1">
              Đã chọn: {formData.subcategoryIds.length} danh mục con
            </p>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Thời gian bắt đầu (không bắt buộc)</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Thời gian kết thúc (không bắt buộc)</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          * Nếu không chọn thời gian, khuyến mãi sẽ áp dụng không giới hạn
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/promotions')}
            className="btn-secondary flex-1"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <FiSave />
            {saveMutation.isPending ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
      </form>
    </div>
  );
}