import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShopSkeleton, AccountCardSkeleton } from '../components/SkeletonLoader';
import { FiSearch, FiTag, FiShoppingCart, FiZap, FiChevronRight } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

// Account Card Component (từ Home.jsx)
const AccountCard = ({ account, onAddToCart, onBuyNow, addToCartPending }) => {
  const category = account.category;
  
  return (
    <div className="account-card flex flex-col">
      <Link to={`/account/${account._id}`} className="block">
        <div className="relative">
          <img
            src={account.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={account.title}
            className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
          />
          {/* Sold Badge */}
          {account.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-900/80 dark:bg-dark/80 rounded-lg flex items-center justify-center">
              <span className="text-red-400 font-bold text-xl">ĐÃ BÁN</span>
            </div>
          )}
        </div>
        <h3 className="text-slate-900 dark:text-white font-semibold mb-2 line-clamp-2 min-h-[2.5rem] text-sm sm:text-base">
          {account.title}
        </h3>
      </Link>
      
      {/* Category Badge */}
      {category && (
        <div className="flex items-center gap-1 mb-2">
          <FiTag className="w-3 h-3 text-primary" />
          <span className="text-xs text-slate-600 dark:text-slate-300">{category.name}</span>
        </div>
      )}
      
      {/* Team Value & BP */}
      <div className="flex flex-wrap gap-2 mb-2">
        {account.teamValue && (
          <span className="text-xs bg-slate-200 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            Đội hình: {account.teamValue}
          </span>
        )}
        {account.bp && (
          <span className="text-xs bg-slate-200 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            BP: {account.bp}
          </span>
        )}
      </div>
      
      {/* Rank */}
      {account.rank && (
        <span className="inline-block bg-primary/20 text-primary px-2 py-0.5 rounded text-xs mb-2 w-fit">
          {account.rank}
        </span>
      )}
      
      <div className="mt-auto space-y-2">
        {/* Price */}
        <div className="flex flex-col gap-0.5">
          {account.originalPrice && account.originalPrice > account.price && (
            <span className="text-slate-500 text-xs line-through">
              {account.originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
          <span className="text-primary font-bold text-lg">
            {account.price.toLocaleString('vi-VN')}đ
          </span>
        </div>
        
        {/* Buttons - Vertical */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <button
            onClick={(e) => onAddToCart(e, account._id)}
            disabled={addToCartPending || account.status === 'sold'}
            className="w-full btn-secondary flex items-center justify-center gap-1 py-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Giỏ hàng</span>
          </button>
          <button
            onClick={(e) => onBuyNow(e, account)}
            disabled={account.status === 'sold'}
            className="w-full btn-primary flex items-center justify-center gap-1 py-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <FiZap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Mua ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ category, accounts, onAddToCart, onBuyNow, addToCartPending }) => {
  if (!accounts || accounts.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {category.thumbnail && (
              <img
                src={category.thumbnail}
                alt={category.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
            {category.name}
          </h2>
          <Link
            to={`/shop?category=${category._id}`}
            className="text-primary hover:text-primary-light flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <span>Xem tất cả</span>
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              addToCartPending={addToCartPending}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { setCartCount, incrementCart } = useCartStore();

  // Get category from URL query params
  const categoryFromUrl = searchParams.get('category');

  // State
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // Set selected category from URL when categories are loaded
  useEffect(() => {
    if (categoryFromUrl && categories) {
      const category = categories.find(c => c._id === categoryFromUrl);
      if (category) {
        setSelectedCategoryId(category._id);
      }
    }
  }, [categoryFromUrl, categories]);

  // Fetch accounts với filters
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts', search, minPrice, maxPrice, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', page);
      params.append('limit', 100);

      const res = await api.get(`/accounts?${params.toString()}`);
      return res.data;
    }
  });

  const accounts = accountsData?.accounts || [];
  const pagination = accountsData?.pagination;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (accountId) => {
      const res = await api.post('/orders/cart', { accountId });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Đã thêm vào giỏ hàng');
      incrementCart();
      queryClient.invalidateQueries(['cart']);
      setCartCount(data?.items?.length || 0);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      }
    }
  });

  // Handle add to cart
  const handleAddToCart = (e, accountId) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate(accountId);
  };

  // Handle buy now
  const handleBuyNow = (e, account) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }));
      sessionStorage.setItem('buyNowAccount', JSON.stringify(account));
      return;
    }
    
    api.post('/orders/cart', { accountId: account._id }).then(() => {
      queryClient.invalidateQueries(['cart']);
      navigate('/checkout');
    }).catch((error) => {
      toast.error(error.response?.data?.message || 'Không thể xử lý');
    });
  };

  // Filter accounts by selected category
  const filteredAccounts = useMemo(() => {
    if (selectedCategoryId === 'all') return accounts;
    return accounts.filter(account => account.category?._id === selectedCategoryId);
  }, [accounts, selectedCategoryId]);

  // Group accounts by category
  const accountsByCategory = useMemo(() => {
    const grouped = {};
    filteredAccounts.forEach((account) => {
      const catId = account.category?._id;
      if (catId) {
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(account);
      }
    });
    return grouped;
  }, [filteredAccounts]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, minPrice, maxPrice, selectedCategoryId]);

  // Reset filter handler
  const handleResetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategoryId('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-28 pb-12">
      <SEOHead
        title="Cửa Hàng Tài Khoản Game Giá Rẻ"
        description="Mua tài khoản game giá rẻ, chất lượng cao. Liên Quân, PUBG, Free Fire, Genshin Impact với giá tốt nhất thị trường."
        keywords="cua hang tai khoan game, tai khoan game gia re, mua tai khoan, lien quan, pubg, free fire"
        type="website"
      />
      {/* Page Title */}
      <div className="container-custom mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {selectedCategoryId === 'all' 
            ? 'Cửa hàng tài khoản' 
            : categories?.find(c => c._id === selectedCategoryId)?.name || 'Tài khoản'
          }
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {filteredAccounts.length} tài khoản được tìm thấy
        </p>
      </div>

      {/* Filters Bar */}
      <div className="container-custom mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full text-sm"
                placeholder="Tìm tài khoản..."
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field w-24 text-sm"
              placeholder="Giá từ"
            />
            <span className="text-slate-500 dark:text-slate-400">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field w-24 text-sm"
              placeholder="Giá đến"
            />
          </div>

          {/* Reset Button */}
          {(search || minPrice || maxPrice) && (
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-sm py-2"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="container-custom mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Tất cả */}
          <button
            onClick={() => {
              setSelectedCategoryId('all');
              navigate('/shop', { replace: true });
            }}
            className={`px-4 py-1.5 rounded-lg whitespace-nowrap transition-all text-sm ${
              selectedCategoryId === 'all'
                ? 'bg-primary text-white font-medium'
                : 'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả
          </button>
          
          {/* Category buttons */}
          {categories?.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategoryId(cat._id);
                navigate(`/shop?category=${cat._id}`, { replace: true });
              }}
              className={`px-4 py-1.5 rounded-lg whitespace-nowrap transition-all text-sm flex items-center gap-2 ${
                selectedCategoryId === cat._id
                  ? 'bg-primary text-white font-medium'
                  : 'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.thumbnail && (
                <img
                  src={cat.thumbnail}
                  alt={cat.name}
                  className="w-5 h-5 rounded object-cover"
                />
              )}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div>
        {isLoading ? (
          <ShopSkeleton />
        ) : filteredAccounts.length === 0 ? (
          <div className="container-custom">
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">Không tìm thấy tài khoản nào</p>
              <button onClick={handleResetFilters} className="btn-secondary">
                Xóa bộ lọc
              </button>
            </div>
          </div>
        ) : selectedCategoryId === 'all' ? (
          /* Hiển thị theo từng danh mục */
          <>
            {categories?.map((category) => {
              const categoryAccounts = accountsByCategory[category._id];
              if (!categoryAccounts || categoryAccounts.length === 0) return null;
              
              return (
                <div key={category._id}>
                  <CategorySection
                    category={category}
                    accounts={categoryAccounts.slice(0, 8)}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    addToCartPending={addToCartMutation.isPending}
                  />
                </div>
              );
            })}

            {/* Uncategorized accounts */}
            {accounts.filter(a => !a.category?._id || !accountsByCategory[a.category?._id]).length > 0 && (
              <div className="py-6">
                <div className="container-custom">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">Tài khoản khác</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {accounts
                      .filter(a => !a.category?._id || !accountsByCategory[a.category?._id])
                      .map((account) => (
                        <AccountCard
                          key={account._id}
                          account={account}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                          addToCartPending={addToCartMutation.isPending}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Hiển thị tài khoản của danh mục được chọn */
          <div>
            <CategorySection
              category={categories?.find(c => c._id === selectedCategoryId)}
              accounts={filteredAccounts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addToCartPending={addToCartMutation.isPending}
            />
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && selectedCategoryId === 'all' && (
          <div className="container-custom mt-8">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-slate-600 dark:text-slate-300 px-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
