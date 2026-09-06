import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiExternalLink } from 'react-icons/fi';
import UploadImage from '../components/UploadImage';

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
      const { data } = await api.get('/admin/sliders');
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
    if (!formData.image) {
      toast.error('Vui lòng upload hình ảnh banner');
      return;
    }
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-700 rounded-lg w-36 animate-pulse" />
        </div>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Hình ảnh</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Phụ đề</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Thứ tự</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Trạng thái</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="px-4 py-3"><div className="w-20 h-12 bg-slate-700 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-700 rounded w-32 animate-pulse" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-slate-700 rounded w-40 animate-pulse" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-5 bg-slate-700 rounded w-8 mx-auto animate-pulse" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-5 bg-slate-700 rounded w-14 mx-auto animate-pulse" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-8 bg-slate-700 rounded w-16 mx-auto animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* Empty State */}
      {sliders?.length === 0 && (
        <div className="card text-center py-12">
          <FiImage className="text-5xl text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Chưa có banner nào</p>
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="inline mr-2" /> Thêm banner đầu tiên
          </button>
        </div>
      )}

      {/* Sliders Table */}
      {sliders && sliders.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Hình ảnh</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Phụ đề</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Thứ tự</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Trạng thái</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sliders.map((slider, index) => (
                <tr
                  key={slider._id}
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Image */}
                  <td className="px-4 py-3">
                    <div className="w-20 h-12 rounded overflow-hidden bg-slate-700 flex-shrink-0">
                      {slider.image ? (
                        <img
                          src={slider.image}
                          alt={slider.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiImage className="text-slate-500" />
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Title */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-100">{slider.title}</span>
                    {slider.link && (
                      <a
                        href={slider.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1"
                      >
                        <FiExternalLink className="inline" /> Xem link
                      </a>
                    )}
                  </td>
                  {/* Subtitle */}
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {slider.subtitle || <span className="text-slate-600 italic">—</span>}
                  </td>
                  {/* Order */}
                  <td className="px-4 py-3 text-center">
                    <span className="badge badge-info">#{slider.order}</span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${slider.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {slider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(slider)}
                        className="p-2 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all"
                        title="Sửa"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(slider._id)}
                        className="p-2 rounded hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 transition-all"
                        title="Xóa"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                <UploadImage
                  label="Hình ảnh banner"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
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
