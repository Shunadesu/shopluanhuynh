import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import UploadImages from '../components/UploadImages';
import { AccountFormSkeleton } from '../components/SkeletonLoader';

// Reusable form group wrapper for consistent spacing
const FormGroup = ({ label, required, children, fullWidth }) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    {label && (
      <label className="block text-xs font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    {children}
  </div>
);

export default function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    username: '',
    password: '',
    password2: '',
    images: [],
    teamValue: '',
    bp: '',
    phone: '',
    email: '',
    cccd: '',
    status: 'available',
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
      const { data } = await api.get(`/admin/accounts/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  // Pre-fill form when account data loaded
  useEffect(() => {
    if (account) {
      setFormData({
        title: account.title || '',
        category: account.category?._id || account.categoryId?._id || account.categoryId || '',
        subcategory: account.subcategory?._id || account.subcategoryId?._id || account.subcategoryId || '',
        price: account.price || '',
        description: account.description || '',
        username: account.username || '',
        password: account.password || '',
        password2: account.password2 || '',
        images: account.images || [],
        teamValue: account.teamValue || '',
        bp: account.bp || '',
        phone: account.phone || '',
        email: account.email || '',
        cccd: account.cccd || '',
        status: account.status || 'available',
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

  // Find selected parent category to access its subcategories
  const selectedParentCategory = categories?.find(
    (cat) => String(cat._id) === String(formData.category)
  );
  const availableSubcategories = selectedParentCategory?.subcategories || [];

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

    if (!formData.username.trim()) {
      toast.error('Vui lòng nhập Username');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Vui lòng nhập Password');
      return;
    }

    // Map frontend field names → backend field names
    // Backend parses loginInfo to extract username/password/password2, so we format it consistently
    const loginInfo = `Username: ${formData.username}\nPassword: ${formData.password}${formData.password2 ? `\nPassword 2: ${formData.password2}` : ''}`;

    const payload = {
      title: formData.title,
      categoryId: formData.category,
      subcategoryId: formData.subcategory || null,
      price: Number(formData.price),
      description: formData.description,
      loginInfo,
      images: formData.images,
      teamValue: formData.teamValue,
      bp: formData.bp,
      phone: formData.phone,
      email: formData.email,
      cccd: formData.cccd,
      status: formData.status,
    };

    if (isEditing) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
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
          {/* ===== Section 1: Thông tin cơ bản ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Thông tin cơ bản
            </h2>

            <FormGroup label="Tiêu đề" required fullWidth>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="VD: Tài khoản FIFA Online rank Vàng"
                required
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Danh mục" required>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value, subcategory: '' })
                  }
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
              </FormGroup>

              <FormGroup label="Danh mục con">
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="input-field"
                  disabled={!formData.category}
                >
                  <option value="">Không chọn</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label="Giá (VNĐ)" required>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="VD: 150000"
                  min="0"
                  required
                />
              </FormGroup>

              <FormGroup label="Trạng thái">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="available">Còn hàng</option>
                  <option value="sold">Đã bán</option>
                  <option value="reserved">Đang giữ</option>
                </select>
              </FormGroup>
            </div>
          </section>

          {/* ===== Section 2: Thông tin đăng nhập ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Thông tin đăng nhập
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Username" required>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field"
                  placeholder="VD: user123"
                  required
                />
              </FormGroup>

              <FormGroup label="Password" required>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="VD: pass123"
                  required
                />
              </FormGroup>

              <FormGroup label="Password 2" fullWidth>
                <input
                  type="text"
                  value={formData.password2}
                  onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                  className="input-field"
                  placeholder="VD: pass456 (nếu tài khoản có mật khẩu cấp 2)"
                />
              </FormGroup>
            </div>
          </section>

          {/* ===== Section 3: Chi tiết tài khoản game ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Chi tiết tài khoản game
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Giá trị đội hình">
                <input
                  type="text"
                  value={formData.teamValue}
                  onChange={(e) => setFormData({ ...formData, teamValue: e.target.value })}
                  className="input-field"
                  placeholder="VD: 50 Tỷ, Full tướng"
                />
              </FormGroup>

              <FormGroup label="Số BP">
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                  className="input-field"
                  placeholder="VD: 50000 BP"
                />
              </FormGroup>
            </div>
          </section>

          {/* ===== Section 4: Thông tin liên hệ ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormGroup label="Số điện thoại">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="VD: 0123456789"
                />
              </FormGroup>

              <FormGroup label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="VD: email@example.com"
                />
              </FormGroup>

              <FormGroup label="CCCD/CMND">
                <input
                  type="text"
                  value={formData.cccd}
                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                  className="input-field"
                  placeholder="VD: 001234567890"
                />
              </FormGroup>
            </div>
          </section>

          {/* ===== Section 5: Hình ảnh ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Hình ảnh
            </h2>
            <UploadImages
              value={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              label="Hình ảnh tài khoản"
              maxImages={10}
            />
          </section>

          {/* ===== Section 6: Mô tả ===== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-700 pb-1.5">
              Mô tả
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Mô tả chi tiết về tài khoản..."
            />
          </section>

          {/* ===== Action buttons ===== */}
          <div className="flex gap-3 pt-3 border-t border-slate-700">
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
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
