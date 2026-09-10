import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import toast from 'react-hot-toast';
import UploadImage from '../components/UploadImage';

// React Quill modules config
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'blockquote', 'code-block',
  'link',
];

export default function NotificationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

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
    dismissDuration: 24,
  });

  // Fetch notification data when editing
  const { data: notification, isLoading: loadingNotification, error } = useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      if (!id) throw new Error('Notification ID is required');
      const { data } = await api.get(`/admin/notifications/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  // Pre-fill form when notification data loaded
  useEffect(() => {
    if (notification) {
      setFormData({
        type: notification.type || 'system',
        title: notification.title || '',
        content: notification.content || '',
        image: notification.image || '',
        order: notification.order ?? 0,
        isActive: notification.isActive ?? true,
        startDate: notification.startDate ? notification.startDate.split('T')[0] : '',
        endDate: notification.endDate ? notification.endDate.split('T')[0] : '',
        dismissible: notification.dismissible ?? true,
        dismissDuration: notification.dismissDuration || 24,
      });
    }
  }, [notification]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/notifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Tạo thông báo thành công');
      navigate('/notifications');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/admin/notifications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notification', id]);
      toast.success('Cập nhật thông báo thành công');
      navigate('/notifications');
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

    // Validate content - strip HTML tags to check if empty
    const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Loading state
  if (isEditing && loadingNotification) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-700 rounded-lg animate-pulse" />
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
          </div>
        </div>
        <div className="card max-w-2xl p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-4 bg-slate-700 rounded w-32 mb-2 animate-pulse" />
                <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isEditing && error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-xl text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Lỗi tải dữ liệu</h1>
            <p className="text-slate-400 mt-1">
              Không thể tải thông tin thông báo. Vui lòng thử lại.
            </p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error.message || 'Đã xảy ra lỗi khi tải dữ liệu'}</p>
          <button
            onClick={() => queryClient.invalidateQueries(['notification', id])}
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
          onClick={() => navigate('/notifications')}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <FiArrowLeft className="text-xl text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEditing ? 'Sửa thông báo' : 'Thêm thông báo'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditing ? 'Cập nhật thông tin thông báo' : 'Tạo thông báo popup mới'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="VD: Chào mừng đến với shop!"
              required
            />
          </div>

          {/* Content - React Quill */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <div className="bg-white rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung thông báo..."
                style={{ minHeight: '180px' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ định dạng: in đậm, in nghiêng, danh sách, liên kết...
            </p>
          </div>

          {/* Image Upload */}
          <UploadImage
            label="Hình ảnh (tùy chọn)"
            value={formData.image}
            onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
          />

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Loại thông báo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="input-field"
            >
              <option value="system">Hệ thống</option>
              <option value="promotion">Khuyến mãi</option>
              <option value="top_deposit">Top nạp tiền</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          {/* Order & Dismiss Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="input-field"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Thời gian ẩn (giờ)
              </label>
              <input
                type="number"
                value={formData.dismissDuration}
                onChange={(e) => setFormData((prev) => ({ ...prev, dismissDuration: parseInt(e.target.value) || 24 }))}
                className="input-field"
                min="1"
                max="168"
                disabled={!formData.dismissible}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dismissible}
                onChange={(e) => setFormData((prev) => ({ ...prev, dismissible: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-300">Cho phép người dùng ẩn thông báo</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-300">Hiển thị thông báo</span>
            </label>
          </div>

          {/* Actions */}
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
              ) : (
                <>
                  <FiSave className="inline mr-2" />
                  {isEditing ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
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
