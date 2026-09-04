import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

export default function Sliders() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    order: 0,
    isActive: true,
  });

  const { data: sliders, isLoading } = useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const { data } = await api.get('/settings/sliders');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/sliders', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sliders']);
      toast.success('Tạo banner thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/sliders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sliders']);
      toast.success('Cập nhật banner thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/sliders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['sliders']);
      toast.success('Xóa banner thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const openModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        title: slider.title,
        subtitle: slider.subtitle || '',
        image: slider.image,
        link: slider.link || '',
        order: slider.order || 0,
        isActive: slider.isActive ?? true,
      });
    } else {
      setEditingSlider(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        order: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSlider) {
      updateMutation.mutate({ id: editingSlider._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa banner này?')) {
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
          <h1 className="text-3xl font-bold text-slate-100">Banner Slider</h1>
          <p className="text-slate-400 mt-1">Quản lý banner trang chủ</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm banner
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {sliders?.map((slider) => (
          <div key={slider._id} className="card group hover:border-cyan-500/50 transition-all">
            <div className="aspect-[21/9] bg-slate-700 rounded-lg mb-4 overflow-hidden">
              {slider.image ? (
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="text-4xl text-slate-500" />
                </div>
              )}
            </div>
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-100 mb-1">{slider.title}</h3>
                {slider.subtitle && (
                  <p className="text-sm text-slate-400">{slider.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${slider.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {slider.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="badge badge-info">#{slider.order}</span>
              </div>
            </div>

            {slider.link && (
              <p className="text-sm text-cyan-400 mb-3 truncate">
                Link: {slider.link}
              </p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => openModal(slider)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
              >
                <FiEdit2 /> Sửa
              </button>
              <button
                onClick={() => handleDelete(slider._id)}
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
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              {editingSlider ? 'Sửa banner' : 'Thêm banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
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
                  Phụ đề
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input-field"
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
                  placeholder="https://example.com/banner.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="input-field"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary">
                  {editingSlider ? 'Cập nhật' : 'Tạo mới'}
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
