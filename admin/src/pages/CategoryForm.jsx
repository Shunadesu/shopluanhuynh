import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import UploadImage from '../components/UploadImage';

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
  });

  // Fetch category data when editing
  const { data: category, isLoading: loadingCategory, error } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required');
      const { data } = await api.get(`/admin/categories/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  // Pre-fill form when category data loaded
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        thumbnail: category.thumbnail || '',
      });
    }
  }, [category]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('Creating category with data:', data);
      return api.post('/admin/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Tạo danh mục thành công');
      navigate('/categories');
    },
    onError: (error) => {
      console.error('Create category error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', id]);
      toast.success('Cập nhật danh mục thành công');
      navigate('/categories');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('Vui lòng nhập slug');
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEditing && loadingCategory) {
    return (
      <div className="space-y-2">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-700 rounded-lg animate-pulse" />
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="card max-w-2xl p-6">
          <div className="space-y-4">
            {/* Name field */}
            <div>
              <div className="h-4 bg-slate-700 rounded w-32 mb-2 animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Slug field */}
            <div>
              <div className="h-4 bg-slate-700 rounded w-20 mb-2 animate-pulse" />
              <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Description field */}
            <div>
              <div className="h-4 bg-slate-700 rounded w-24 mb-2 animate-pulse" />
              <div className="h-32 bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Image upload */}
            <div>
              <div className="h-4 bg-slate-700 rounded w-36 mb-2 animate-pulse" />
              <div className="h-48 bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <div className="h-12 bg-slate-700 rounded-lg flex-1 animate-pulse" />
              <div className="h-12 bg-slate-800 rounded-lg flex-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isEditing && error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categories')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-xl text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Lỗi tải dữ liệu</h1>
            <p className="text-slate-400 mt-1">
              Không thể tải thông tin danh mục. Vui lòng thử lại.
            </p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}</p>
          <button
            onClick={() => queryClient.invalidateQueries(['category', id])}
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
          onClick={() => navigate('/categories')}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <FiArrowLeft className="text-xl text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEditing ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditing ? 'Cập nhật thông tin danh mục' : 'Tạo danh mục sản phẩm mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên danh mục <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="input-field"
              placeholder="VD: Game PC, Game Mobile"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="input-field"
              placeholder="VD: game-pc, game-mobile"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Slug là phiên bản thân thiện của URL, chỉ chứa chữ thường và dấu gạch ngang
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows="4"
              placeholder="Mô tả ngắn về danh mục..."
            />
          </div>

          <UploadImage
            value={formData.thumbnail}
            onChange={(thumbnail) => setFormData((prev) => ({ ...prev, thumbnail }))}
            label="Hình ảnh danh mục"
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
              onClick={() => navigate('/categories')}
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
