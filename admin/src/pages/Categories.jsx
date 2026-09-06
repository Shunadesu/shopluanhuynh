import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiRefreshCw } from 'react-icons/fi';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function Categories() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
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

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['categories']);
    toast.success('Đã làm mới dữ liệu');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-700 rounded-lg w-40 animate-pulse" />
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-700 rounded w-40 animate-pulse" />
                  <div className="h-4 bg-slate-700 rounded w-64 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Làm mới
          </button>
          <Link to="/categories/add" className="btn-primary flex items-center gap-2">
            <FiPlus /> Thêm danh mục
          </Link>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Hình ảnh</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Tên danh mục</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Slug</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Mô tả</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <tr key={category._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden">
                      {category.thumbnail ? (
                        <img
                          src={getImageUrl(category.thumbnail)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${category.thumbnail ? 'hidden' : ''}`}>
                        <FiImage className="text-2xl text-slate-500" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-100">{category.name}</span>
                  </td>
                  <td className="p-4">
                    <code className="text-sm text-cyan-400 bg-slate-700 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400 max-w-xs truncate block">
                      {category.description || 'Chưa có mô tả'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/categories/edit/${category._id}`}
                        className="p-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 bg-slate-700 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!categories || categories.length === 0) && (
          <div className="p-8 text-center text-slate-400">
            Chưa có danh mục nào
          </div>
        )}
      </div>
    </div>
  );
}
