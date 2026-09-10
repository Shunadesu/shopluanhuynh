import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Notifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
        <button onClick={() => navigate('/notifications/add')} className="btn-primary flex items-center gap-2">
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
            <button onClick={() => navigate('/notifications/add')} className="btn-primary mt-4">
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
                  onClick={() => navigate(`/notifications/edit/${notification._id}`)}
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

    </div>
  );
}
