import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiCalendar } from 'react-icons/fi';
import UploadImage from '../components/UploadImage';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Notifications() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    content: '',
    image: '',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    dismissible: true,
    dismissDuration: 24
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/notifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Tạo thông báo thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/notifications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Cập nhật thông báo thành công');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Xóa thông báo thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const openModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        type: notification.type || 'system',
        title: notification.title || '',
        content: notification.content || '',
        image: notification.image || '',
        order: notification.order || 0,
        isActive: notification.isActive ?? true,
        startDate: notification.startDate ? notification.startDate.split('T')[0] : '',
        endDate: notification.endDate ? notification.endDate.split('T')[0] : '',
        dismissible: notification.dismissible ?? true,
        dismissDuration: notification.dismissDuration || 24
      });
    } else {
      setEditingNotification(null);
      setFormData({
        type: 'system',
        title: '',
        content: '',
        image: '',
        order: 0,
        isActive: true,
        startDate: '',
        endDate: '',
        dismissible: true,
        dismissDuration: 24
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNotification) {
      updateMutation.mutate({ id: editingNotification._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Thông báo</h1>
          <p className="text-slate-400 mt-1">Quản lý thông báo popup cho người dùng</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Thêm thông báo
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-slate-400">Đang tải...</div>
        ) : notifications?.length === 0 ? (
          <div className="card text-center py-12">
            <FiImage className="mx-auto text-5xl text-slate-600 mb-4" />
            <p className="text-slate-400">Chưa có thông báo nào</p>
            <button onClick={() => openModal()} className="btn-primary mt-4">
              Tạo thông báo đầu tiên
            </button>
          </div>
        ) : (
          notifications?.map((notification) => (
            <div key={notification._id} className="card group hover:border-cyan-500/50 transition-all">
              <div className="flex gap-4">
                {/* Preview Image */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
                  {notification.image ? (
                    <img
                      src={notification.image}
                      alt={notification.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="text-2xl text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">{notification.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{notification.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`badge ${notification.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {notification.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="badge badge-info">#{notification.order}</span>
                    {notification.type && (
                      <span className="capitalize">{notification.type === 'top_deposit' ? 'Nạp tiền top' : notification.type}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiCalendar className="text-xs" />
                      {formatDate(notification.startDate)} - {formatDate(notification.endDate)}
                    </span>
                    {notification.dismissible && (
                      <span>Ẩn sau {notification.dismissDuration}h</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => openModal(notification)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
                >
                  <FiEdit2 /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 rounded-lg transition-all"
                >
                  <FiTrash2 /> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              {editingNotification ? 'Sửa thông báo' : 'Thêm thông báo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="VD: Chào mừng đến với shop!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nội dung * (hỗ trợ HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="VD: Chào mừng bạn đến với shop! <a href='https://facebook.com'>Fanpage</a>"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Có thể sử dụng HTML như &lt;a href="..."&gt;, &lt;strong&gt;</p>
              </div>

              <UploadImage
                label="Hình ảnh (tùy chọn)"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Loại thông báo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="system">Hệ thống</option>
                  <option value="promotion">Khuyến mãi</option>
                  <option value="top_deposit">Top nạp tiền</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thời gian ẩn (giờ)
                  </label>
                  <input
                    type="number"
                    value={formData.dismissDuration}
                    onChange={(e) => setFormData({ ...formData, dismissDuration: parseInt(e.target.value) || 24 })}
                    className="input-field"
                    min="1"
                    max="168"
                    disabled={!formData.dismissible}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-300">Cho phép người dùng ẩn thông báo</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-300">Hiển thị thông báo</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary">
                  {editingNotification ? 'Cập nhật' : 'Tạo mới'}
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
