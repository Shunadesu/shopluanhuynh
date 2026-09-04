import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

export default function Categories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Tạo danh mục thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Cập nhật danh mục thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Xóa danh mục thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      deleteMutation.mutate(id);
    }
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
          <h1 className="text-3xl font-bold text-slate-100">Danh mục</h1>
          <p className="text-slate-400 mt-1">Quản lý danh mục sản phẩm</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm danh mục
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {categories?.map((category) => (
          <div key={category._id} className="card group hover:border-cyan-500/50 transition-all">
            <div className="aspect-video bg-slate-700 rounded-lg mb-2 overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="text-4xl text-slate-500" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">{category.name}</h3>
            <p className="text-sm text-slate-400 mb-2 line-clamp-2">
              {category.description || 'Chưa có mô tả'}
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => openModal(category)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
              >
                <FiEdit2 /> Sửa
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 rounded-lg transition-all"
              >
                <FiTrash2 /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-field"
                  required
                />
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
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary">
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary"
                >
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
