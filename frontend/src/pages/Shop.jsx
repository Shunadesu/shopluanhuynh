import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Shop = () => {
  const { categorySlug } = useParams();
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  const [page, setPage] = useState(1);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // Fetch accounts with filters
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts', selectedCategory, search, minPrice, maxPrice, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/accounts?${params.toString()}`);
      return res.data;
    }
  });

  const accounts = accountsData?.accounts || [];
  const pagination = accountsData?.pagination;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-white mb-8">Cửa hàng tài khoản</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FiFilter className="mr-2" />
                Bộ lọc
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-slate-300 mb-2">Tìm kiếm</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Tìm tài khoản..."
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-slate-300 mb-2">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-slate-300 mb-2">Khoảng giá</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="input-field"
                    placeholder="Giá từ"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="input-field"
                    placeholder="Giá đến"
                  />
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearch('');
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedCategory('');
                  setPage(1);
                }}
                className="btn-secondary w-full"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <Loading />
            ) : accounts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 text-lg">Không tìm thấy tài khoản nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                  {accounts.map((account) => (
                    <Link
                      key={account._id}
                      to={`/account/${account._id}`}
                      className="card hover:scale-105 transition-transform"
                    >
                      <div className="relative">
                        <img
                          src={account.images?.[0] || '/placeholder.jpg'}
                          alt={account.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        {account.status === 'sold' && (
                          <div className="absolute inset-0 bg-dark/80 rounded-lg flex items-center justify-center">
                            <span className="text-red-400 font-bold text-xl">ĐÃ BÁN</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2 line-clamp-2 min-h-[3rem]">
                        {account.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {account.rank && (
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                            {account.rank}
                          </span>
                        )}
                        {account.server && (
                          <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                            {account.server}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          {account.originalPrice && account.originalPrice > account.price && (
                            <span className="text-slate-500 text-sm line-through">
                              {account.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                          <span className="text-primary font-bold text-xl">
                            {account.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="text-slate-300">
                      Trang {page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
