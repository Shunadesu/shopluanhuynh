import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiStar, FiImage } from 'react-icons/fi';
import { TableSkeleton, FilterSkeleton } from '../components/SkeletonLoader';
import ImageGalleryModal from '../components/ImageGalleryModal';

export default function Accounts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [gallery, setGallery] = useState({ urls: [], index: 0 }); // { urls: string[], index: number }

  // Collect all images from an account (thumbnail + images array)
  const getAllImages = (account) => {
    const imgs = [];
    if (account.thumbnail) imgs.push(account.thumbnail);
    if (Array.isArray(account.images)) {
      account.images.forEach((img) => {
        const url = typeof img === 'string' ? img : img.url;
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    return imgs;
  };

  // Use admin endpoint to get full account data
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['admin-accounts', selectedCategory, selectedSubcategory, statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/admin/accounts?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedSubcategory) url += `subcategory=${selectedSubcategory}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  // Fetch subcategories when category changes
  const fetchSubcategories = async (categoryId) => {
    if (categoryId) {
      const { data } = await api.get(`/categories/${categoryId}/subcategories`);
      setSubcategories(data || []);
      // Reset subcategory selection when category changes
      setSelectedSubcategory('');
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  };

  // Update query to include subcategories
  const { data: categoriesWithSub } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data } = await api.get('/categories/all');
      return data;
    },
  });

  // Toggle hot mutation
  const toggleHotMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/accounts/${id}/toggle-hot`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-accounts']);
      toast.success(res.data?.message || 'Đã cập nhật');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-accounts']);
      toast.success('Xóa tài khoản thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSubcategories([]);
    setStatusFilter('');
    queryClient.invalidateQueries(['admin-accounts']);
    toast.success('Đã làm mới dữ liệu');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Còn hàng', class: 'badge-success' },
      sold: { text: 'Đã bán', class: 'badge-danger' },
      reserved: { text: 'Đang giữ', class: 'badge-warning' },
    };
    return statusMap[status] || statusMap.available;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-36 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-700 rounded-lg w-40 animate-pulse" />
        </div>

        {/* Filter Skeleton */}
        <FilterSkeleton />

        {/* Table Skeleton */}
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Tài khoản game</h1>
          <p className="text-slate-400 mt-1">
            Quản lý tài khoản game
            {accountsData?.pagination?.total != null && (
              <span className="ml-2 text-slate-500">({accountsData.pagination.total} tài khoản)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Làm mới
          </button>
          <Link to="/accounts/add" className="btn-primary flex items-center gap-2">
            <FiPlus /> Thêm tài khoản
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-52 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tài khoản..."
            className="input-field pl-11 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            fetchSubcategories(e.target.value);
          }}
          className="input-field w-52"
        >
          <option value="">Tất cả danh mục</option>
          {categoriesWithSub?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="input-field w-44"
          disabled={!selectedCategory || subcategories.length === 0}
        >
          <option value="">Tất cả danh mục con</option>
          {subcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-44"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Còn hàng</option>
          <option value="sold">Đã bán</option>
          <option value="reserved">Đang giữ</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="table-container overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16">Hình</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Danh mục con</th>
              <th>Tài khoản / Mật khẩu</th>
              <th>Giá</th>
              <th className="w-16">Hot</th>
              <th>Hàng đợi</th>
              <th className="max-w-48">Mô tả</th>
              <th>Trạng thái</th>
              <th className="w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {accountsData?.accounts?.length > 0 ? (
              accountsData.accounts.map((account) => (
                <tr key={account._id} className="align-top">
                  {/* Hình */}
                  <td>
                    {(() => {
                      const allImages = getAllImages(account);
                      if (!allImages.length) {
                        return (
                          <div className="w-14 h-14 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-500">
                            <FiImage />
                          </div>
                        );
                      }
                      // Hiển thị tối đa 4 thumbnail trong grid 2x2
                      const visible = allImages.slice(0, 4);
                      const extra = allImages.length - 4;
                      return (
                        <div className="flex flex-col gap-1">
                          <div
                            className="grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden cursor-pointer"
                            style={{ width: 68, height: 68 }}
                            onClick={() => setGallery({ urls: allImages.map(url => getImageUrl(url)), index: 0 })}
                          >
                            {visible.map((url, i) => (
                              <div key={i} className="relative bg-slate-700">
                                <img
                                  src={getImageUrl(url)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                {/* Số thứ tự */}
                                <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] font-bold px-1 rounded leading-none">
                                  {i + 1}
                                </span>
                              </div>
                            ))}
                            {/* Ô dư nếu chưa đủ 4 */}
                            {visible.length < 4 &&
                              Array.from({ length: 4 - visible.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-slate-800" />
                              ))}
                          </div>
                          {/* Số ảnh còn lại */}
                          {extra > 0 && (
                            <span
                              className="text-[10px] text-slate-400 text-center cursor-pointer hover:text-cyan-400"
                              onClick={() => setGallery({ urls: allImages.map(url => getImageUrl(url)), index: 0 })}
                            >
                              +{extra} ảnh
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Tiêu đề */}
                  <td className="font-medium text-slate-100 max-w-xs">
                    <div className="truncate" title={account.title}>{account.title}</div>
                  </td>

                  {/* Danh mục */}
                  <td>
                    <span className="text-sm text-slate-300">
                      {(account.category || account.categoryId)?.name || '-'}
                    </span>
                  </td>

                  <td>
                    <span className="text-sm text-slate-300">
                      {account.subcategory?.name || account.subcategoryId?.name || ''}
                    </span>
                  </td>

                  {/* Tài khoản / Mật khẩu */}
                  <td className="text-sm min-w-40">
                    <div className="text-slate-300 truncate" title={account.username || ''}>
                      TK: {account.username || '-'}
                    </div>
                    <div className="text-slate-400 truncate" title={account.password || ''}>
                      MK1: {account.password || '-'}
                    </div>
                    {account.password2 && (
                      <div className="text-slate-400 truncate" title={account.password2}>
                        MK2: {account.password2}
                      </div>
                    )}
                  </td>

                  {/* Giá */}
                  <td>
                    <div className="flex flex-col">
                      {account.originalPrice > 0 && (
                        <span className="text-xs text-slate-500 line-through">
                          {account.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                      <span className="font-semibold text-cyan-400 text-sm">
                        {account.price?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </td>

                  {/* Hot */}
                  <td>
                    <button
                      onClick={() => toggleHotMutation.mutate(account._id)}
                      disabled={toggleHotMutation.isPending}
                      className={`p-2 rounded-lg transition-all ${
                        account.isHot
                          ? 'text-yellow-400 hover:bg-yellow-400/10'
                          : 'text-slate-600 hover:text-yellow-400 hover:bg-yellow-400/10'
                      }`}
                      title={account.isHot ? 'Bỏ Hot' : 'Đánh dấu Hot'}
                    >
                      <FiStar className={account.isHot ? 'fill-current' : ''} />
                    </button>
                  </td>

                  {/* Hàng đợi */}
                  <td className="text-sm min-w-32">
                    {account.teamValue && (
                      <div className="text-slate-300 truncate" title={account.teamValue}>
                        DH: {account.teamValue}
                      </div>
                    )}
                    {account.bp && (
                      <div className="text-slate-400 truncate" title={account.bp}>
                        BP: {account.bp}
                      </div>
                    )}
                    {!account.teamValue && !account.bp && (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Mô tả */}
                  <td className="text-sm text-slate-400 max-w-48">
                    {account.description ? (
                      <span className="line-clamp-2" title={account.description}>
                        {account.description}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td>
                    <span className={`badge ${getStatusBadge(account.status).class}`}>
                      {getStatusBadge(account.status).text}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td>
                    <div className="flex gap-1">
                      <Link
                        to={`/accounts/edit/${account._id}`}
                        className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center text-slate-400 py-8">
                  Chưa có tài khoản nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {accountsData?.pagination && accountsData.pagination.pages > 1 && (
        <div className="text-center text-slate-400 text-sm">
          Trang {accountsData.pagination.page} / {accountsData.pagination.pages} — {accountsData.pagination.total} tài khoản
        </div>
      )}

      {/* Image gallery modal */}
      {gallery.urls.length > 0 && (
        <ImageGalleryModal
          urls={gallery.urls}
          startIndex={gallery.index}
          onClose={() => setGallery({ urls: [], index: 0 })}
        />
      )}
    </div>
  );
}
