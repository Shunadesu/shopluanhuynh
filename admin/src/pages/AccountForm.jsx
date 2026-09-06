import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import UploadImages from '../components/UploadImages';
import { AccountFormSkeleton } from '../components/SkeletonLoader';

export default function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    loginInfo: '',
    images: [],
    teamValue: '',
    bp: '',
    phone: '',
    email: '',
    cccd: '',
    status: 'available',
    isHot: false,
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  // Fetch account data when editing
  const { data: account, isLoading: loadingAccount, error: accountError } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      if (!id) throw new Error('Account ID is required');
      const { data } = await api.get(`/accounts/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  // Pre-fill form when account data loaded
  useEffect(() => {
    if (account) {
      setFormData({
        title: account.title || '',
        category: account.category?._id || '',
        price: account.price || '',
        description: account.description || '',
        loginInfo: account.loginInfo || '',
        images: account.images || [],
        teamValue: account.teamValue || '',
        bp: account.bp || '',
        phone: account.phone || '',
        email: account.email || '',
        cccd: account.cccd || '',
        status: account.status || 'available',
        isHot: account.isHot || false,
      });
    }
  }, [account]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Tạo tài khoản thành công');
      navigate('/accounts');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      queryClient.invalidateQueries(['account', id]);
      toast.success('Cập nhật tài khoản thành công');
      navigate('/accounts');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    
    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (isEditing) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEditing && loadingAccount) {
    return <AccountFormSkeleton />;
  }

  // Handle error state
  if (isEditing && accountError) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/accounts')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-xl text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Lỗi tải dữ liệu</h1>
            <p className="text-slate-400 mt-1">
              Không thể tải thông tin tài khoản. Vui lòng thử lại.
            </p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{accountError.message || 'Đã xảy ra lỗi khi tải dữ liệu'}</p>
          <button
            onClick={() => queryClient.invalidateQueries(['account', id])}
            className="btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/accounts')}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <FiArrowLeft className="text-xl text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditing ? 'Cập nhật thông tin tài khoản' : 'Tạo tài khoản game mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="VD: Tài khoản FIFA Online"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Danh mục <span className="text-red-400">*</span>
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
                Giá (VNĐ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                placeholder="VD: 150000"
                min="0"
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
                Đánh dấu Hot
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isHot}
                  onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0"
                />
                <span className="text-slate-300 text-sm">Hiển thị ở danh sách Hot</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Giá trị đội hình
              </label>
              <input
                type="text"
                value={formData.teamValue}
                onChange={(e) => setFormData({ ...formData, teamValue: e.target.value })}
                className="input-field"
                placeholder="VD: 50 Tỷ, Full tướng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Số BP
              </label>
              <input
                type="text"
                value={formData.bp}
                onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                className="input-field"
                placeholder="VD: 50000 BP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="VD: 0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="VD: email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CCCD/CMND
              </label>
              <input
                type="text"
                value={formData.cccd}
                onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                className="input-field"
                placeholder="VD: 001234567890"
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
              rows="4"
              placeholder="Mô tả chi tiết về tài khoản..."
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
              rows="3"
              placeholder="Username: xxx | Password: xxx | Email: xxx"
            />
          </div>

          <UploadImages
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            label="Hình ảnh tài khoản"
            maxImages={10}
          />

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </span>
              ) : isEditing ? (
                'Cập nhật'
              ) : (
                'Tạo mới'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/accounts')}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
