import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCategories, useAccountList } from '../hooks';
import { ShopSkeleton, AccountCardSkeleton } from '../components/SkeletonLoader';
import { FiSearch, FiTag, FiShoppingCart, FiZap, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
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
        <div className="flex flex-col gap-0.5 min-h-[1rem]">
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

// Subcategory Section Component
const SubcategorySection = ({ parentCategory, subcategories, onSelectSubcategory, onBack }) => {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
            {/* <span className="text-sm">Quay lại</span> */}
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {parentCategory.thumbnail && (
              <img
                src={parentCategory.thumbnail}
                alt={parentCategory.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
            {parentCategory.name}
          </h2>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory._id}
              onClick={() => onSelectSubcategory(subcategory)}
              className="card p-4 hover:shadow-lg transition-shadow text-center"
            >
              {subcategory.thumbnail ? (
                <img
                  src={subcategory.thumbnail}
                  alt={subcategory.name}
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-20 rounded-lg mb-3 bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 flex items-center justify-center mx-auto">
                  <span className="text-white text-xl font-bold opacity-50">
                    {subcategory.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
                {subcategory.name}
              </h3>
              {subcategory.description && (
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                  {subcategory.description}
                </p>
              )}
              <span className="inline-block mt-2 text-primary text-sm font-medium">
                Xem tài khoản →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const incrementCart = useCartStore((s) => s.incrementCart);

  // Get category and subcategory from URL query params
  const categoryFromUrl = searchParams.get('category');
  const subcategoryFromUrl = searchParams.get('subcategory');

  // State
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [page, setPage] = useState(1);
  const [addToCartPending, setAddToCartPending] = useState(false);

  // Fetch categories
  const { data: categories } = useCategories();

  // Find selected category object
  const selectedCategory = categories?.find(c => c._id === selectedCategoryId);
  const hasSubcategories = selectedCategory?.subcategories?.length > 0;

  // Set selected category/subcategory from URL when categories are loaded
  useEffect(() => {
    if (categories) {
      if (subcategoryFromUrl) {
        // Find subcategory's parent
        for (const cat of categories) {
          if (cat.subcategories?.some(s => s._id === subcategoryFromUrl)) {
            setSelectedCategoryId(cat._id);
            setSelectedSubcategoryId(subcategoryFromUrl);
            return;
          }
        }
      } else if (categoryFromUrl) {
        const category = categories.find(c => c._id === categoryFromUrl);
        if (category) {
          setSelectedCategoryId(category._id);
          setSelectedSubcategoryId(null);
        }
      } else {
        setSelectedCategoryId('all');
        setSelectedSubcategoryId(null);
      }
    }
  }, [categoryFromUrl, subcategoryFromUrl, categories]);

  // Fetch accounts với filters
  const { accounts, loading: isLoading, pagination } = useAccountList({
    search,
    minPrice,
    maxPrice,
    page,
    limit: 100,
    ...(selectedSubcategoryId ? { subcategory: selectedSubcategoryId } : {}),
    ...(selectedCategoryId !== 'all' && !selectedSubcategoryId ? { category: selectedCategoryId } : {}),
  });

  const handleAddToCart = async (e, accountId) => {
    e.preventDefault();
    e.stopPropagation();
    setAddToCartPending(true);
    try {
      const data = await useCartStore.getState().addToCart(accountId);
      toast.success('Đã thêm vào giỏ hàng');
      incrementCart();
      useCartStore.setState({ cartCount: data?.items?.length || 0 });
    } catch (error) {
      if (error?.__skipped || error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAddToCartPending(false);
    }
  };

  const handleBuyNow = async (e, account) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }));
      sessionStorage.setItem('buyNowAccount', JSON.stringify(account));
      return;
    }

    try {
      await useCartStore.getState().addToCart(account._id);
      navigate('/checkout');
    } catch (error) {
      if (error?.__skipped || error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để mua ngay');
      } else {
        toast.error(error.response?.data?.message || 'Không thể xử lý');
      }
    }
  };

  // Filter accounts by selected category/subcategory
  const filteredAccounts = useMemo(() => {
    if (selectedSubcategoryId) {
      return accounts.filter(account => account.category?._id === selectedSubcategoryId);
    }
    if (selectedCategoryId === 'all') return accounts;
    return accounts.filter(account => account.category?._id === selectedCategoryId);
  }, [accounts, selectedCategoryId, selectedSubcategoryId]);

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
  }, [search, minPrice, maxPrice, selectedCategoryId, selectedSubcategoryId]);

  // Reset filter handler
  const handleResetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategoryId('all');
    setSelectedSubcategoryId(null);
    setPage(1);
    setSearchParams({});
  };

  // Handle category button click
  const handleCategoryClick = (cat) => {
    if (cat.subcategories?.length > 0) {
      // Có subcategories -> hiển thị subcategories
      setSelectedCategoryId(cat._id);
      setSelectedSubcategoryId(null);
      navigate(`/shop?category=${cat._id}`, { replace: true });
    } else {
      // Không có subcategories -> lọc accounts
      setSelectedCategoryId(cat._id);
      setSelectedSubcategoryId(null);
      navigate(`/shop?category=${cat._id}`, { replace: true });
    }
  };

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategoryId(subcategory._id);
    navigate(`/shop?category=${selectedCategoryId}&subcategory=${subcategory._id}`, { replace: true });
  };

  // Handle back from subcategories
  const handleBackFromSubcategories = () => {
    setSelectedSubcategoryId(null);
    navigate(`/shop?category=${selectedCategoryId}`, { replace: true });
  };

  // Get page title
  const getPageTitle = () => {
    if (selectedSubcategoryId) {
      const subcategory = selectedCategory?.subcategories?.find(s => s._id === selectedSubcategoryId);
      return subcategory?.name || 'Tài khoản';
    }
    if (selectedCategoryId === 'all') return 'Cửa hàng tài khoản';
    return selectedCategory?.name || 'Tài khoản';
  };

  return (
    <div className="min-h-screen pt-20 pb-6">
      <SEOHead
        title="Cửa Hàng Tài Khoản Game Giá Rẻ"
        description="Mua tài khoản game giá rẻ, chất lượng cao. Liên Quân, PUBG, Free Fire, Genshin Impact với giá tốt nhất thị trường."
        keywords="cua hang tai khoan game, tai khoan game gia re, mua tai khoan, lien quan, pubg, free fire"
        type="website"
      />
      {/* Breadcrumb Navigation */}
      <div className="container-custom mb-4">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              setSelectedCategoryId('all');
              setSelectedSubcategoryId(null);
              navigate('/shop');
            }}
            className="text-slate-500 hover:text-primary transition-colors"
          >
            Cửa hàng
          </button>
          
          {selectedCategory && selectedCategoryId !== 'all' && (
            <>
              <span className="text-slate-400">/</span>
              <button
                onClick={() => {
                  setSelectedSubcategoryId(null);
                  navigate(`/shop?category=${selectedCategoryId}`);
                }}
                className={`hover:text-primary transition-colors ${
                  selectedSubcategoryId ? 'text-slate-500' : 'text-primary font-medium'
                }`}
              >
                {selectedCategory.name}
              </button>
            </>
          )}
          
          {selectedSubcategoryId && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-primary font-medium">
                {selectedCategory?.subcategories?.find(s => s._id === selectedSubcategoryId)?.name}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Page Title */}
      <div className="container-custom mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {getPageTitle()}
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
              setSelectedSubcategoryId(null);
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
          {categories?.map((cat) => {
            const hasSubs = cat.subcategories?.length > 0;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat)}
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
                {hasSubs && (
                  <span className="text-xs opacity-70">({cat.subcategories.length})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Section - Hiển thị khi đã chọn category có subcategories */}
      {selectedCategory && hasSubcategories && !selectedSubcategoryId && (
        <SubcategorySection
          parentCategory={selectedCategory}
          subcategories={selectedCategory.subcategories}
          onSelectSubcategory={handleSubcategoryClick}
          onBack={() => {
            setSelectedCategoryId('all');
            setSelectedSubcategoryId(null);
            navigate('/shop', { replace: true });
          }}
        />
      )}

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
                    addToCartPending={addToCartPending}
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
                          addToCartPending={addToCartPending}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : selectedSubcategoryId ? (
          /* Hiển thị tài khoản của subcategory được chọn */
          <div>
            <CategorySection
              category={selectedCategory?.subcategories?.find(s => s._id === selectedSubcategoryId) || selectedCategory}
              accounts={filteredAccounts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addToCartPending={addToCartPending}
            />
          </div>
        ) : (
          /* Hiển thị tài khoản của category được chọn (không có subcategory) */
          <div>
            <CategorySection
              category={selectedCategory}
              accounts={filteredAccounts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addToCartPending={addToCartPending}
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
