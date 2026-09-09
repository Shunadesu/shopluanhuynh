import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiRefreshCw, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function Categories() {
  const queryClient = useQueryClient();
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Fetch all categories including inactive - for admin tree view
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data } = await api.get('/categories/all');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories-all']);
      queryClient.invalidateQueries(['categories']);
      toast.success('Xóa danh mục thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Toggle isActive mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/admin/categories/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories-all']);
      queryClient.invalidateQueries(['categories']);
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleToggleActive = (id, currentActive) => {
    toggleActiveMutation.mutate({ id, isActive: !currentActive });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này? Tất cả danh mục con sẽ bị xóa.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['categories-all']);
    toast.success('Đã làm mới dữ liệu');
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-40 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-700 rounded-lg w-40 animate-pulse" />
        </div>
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded animate-pulse" />
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

      {/* Categories Tree Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-sm font-semibold text-slate-300 w-12"></th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300 w-20">Hình ảnh</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300 min-w-[180px]">Tên danh mục</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300 min-w-[160px]">Slug</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 w-24">Thứ tự</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-300 w-32">Trạng thái</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-300 w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => {
                const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                const isExpanded = expandedIds.has(category._id);

                const handleRowClick = (e) => {
                  // Don't toggle if user clicked on action buttons or links inside the row
                  if (e.target.closest('a, button')) return;
                  if (hasSubcategories) {
                    toggleExpand(category._id);
                  }
                };

                return (
                  <tbody key={category._id}>
                    {/* Parent Category Row - clickable to expand/collapse */}
                    <tr
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors bg-slate-800/50 ${
                        hasSubcategories ? 'cursor-pointer' : ''
                      }`}
                      onClick={handleRowClick}
                    >
                      {/* Expand/Collapse Indicator */}
                      <td className="p-4">
                        {hasSubcategories ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(category._id);
                            }}
                            className="p-1 hover:bg-slate-700 rounded transition-all text-slate-300"
                            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                          >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                          </button>
                        ) : (
                          <span className="w-6 inline-block"></span>
                        )}
                      </td>

                      {/* Thumbnail */}
                      <td className="p-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                          {category.thumbnail ? (
                            <img
                              src={getImageUrl(category.thumbnail)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="text-xl text-slate-500" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-medium text-slate-100">{category.name}</span>
                          {hasSubcategories && (
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {category.subcategories.length} con
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">
                            {category.description}
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="p-4">
                        <code className="text-xs text-cyan-400 bg-slate-700 px-2 py-1 rounded whitespace-nowrap inline-block">
                          {category.slug}
                        </code>
                      </td>

                      {/* Order */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className="text-slate-300">{category.order ?? 0}</span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(category._id, category.isActive);
                          }}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            category.isActive
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {category.isActive ? 'Hoạt động' : 'Tắt'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {hasSubcategories && (
                            <Link
                              to={`/categories/add?parentId=${category._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
                              title="Thêm danh mục con"
                            >
                              <FiPlus className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/categories/edit/${category._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
                            title="Sửa"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(category._id);
                            }}
                            className="p-2 bg-slate-700 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Subcategory Rows */}
                    {hasSubcategories && isExpanded && category.subcategories.map((sub) => (
                      <tr
                        key={sub._id}
                        className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                      >
                        {/* Empty first column for indent */}
                        <td className="p-4">
                          <span className="w-6 inline-block"></span>
                        </td>

                        {/* Thumbnail */}
                        <td className="p-4">
                          <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                            {sub.thumbnail ? (
                              <img
                                src={getImageUrl(sub.thumbnail)}
                                alt={sub.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiImage className="text-lg text-slate-500" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name with sub-indicator */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 pl-4 border-l-2 border-cyan-500/30 whitespace-nowrap">
                            <span className="text-slate-300">{sub.name}</span>
                          </div>
                          {sub.description && (
                            <div className="text-xs text-slate-500 mt-1 pl-4 border-l-2 border-cyan-500/30 line-clamp-1 max-w-md">
                              {sub.description}
                            </div>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="p-4">
                          <code className="text-xs text-cyan-400 bg-slate-700 px-2 py-1 rounded whitespace-nowrap inline-block">
                            {sub.slug}
                          </code>
                        </td>

                        {/* Order */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="text-slate-400">{sub.order ?? 0}</span>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleActive(sub._id, sub.isActive)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                              sub.isActive
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            {sub.isActive ? 'Hoạt động' : 'Tắt'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/categories/edit/${sub._id}`}
                              className="p-2 bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <FiEdit2 />
                            </Link>
                            <button
                              onClick={() => handleDelete(sub._id)}
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
                );
              })}
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
