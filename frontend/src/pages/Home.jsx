import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSliders, useCategories, useAccountList } from '../hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FiChevronRight, FiSearch, FiX } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import AccountCard from '../components/AccountCard';
import { AccountCardSkeleton } from '../components/SkeletonLoader';

// Skeleton loader components
const SkeletonCategoryCard = () => (
  <div className="card animate-pulse">
    <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-t-lg mb-2" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-1" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
  </div>
);

// Category Section Component
const CategoryAccountSection = ({ category, accounts, isLoading }) => {
  if (isLoading) {
    return (
      <section className="py-2">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <AccountCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!accounts || accounts.length === 0) return null;

  return (
    <section className="py-2">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {category.thumbnail && (
              <img
                src={category.thumbnail}
                alt={category.name}
                className="w-6 h-6 rounded object-cover"
              />
            )}
            {category.name}
          </h2>
          <Link
            to={`/shop?category=${category._id}`}
            className="text-primary hover:text-primary-light flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <span>Xem tất cả</span>
            <FiChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const accountsRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    priceRange: 'all',
    sortBy: 'default',
    searchName: '',
    searchCode: '',
  });

  // Temporary input states (before clicking "Tìm kiếm")
  const [tempSearchName, setTempSearchName] = useState('');
  const [tempSearchCode, setTempSearchCode] = useState('');

  // Track scroll position for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch sliders
  const { data: sliders } = useSliders();

  // Fetch categories
  const { data: categories, loading: categoriesLoading } = useCategories();

  // Fetch all accounts (for grouping by category)
  const { accounts: allAccounts, loading: accountsLoading } = useAccountList({ limit: 100 });

  // Determine data to display
  // Categories: skeleton during initial load, real data when loaded, empty state when no data
  const categoriesLoaded = !categoriesLoading && Array.isArray(categories);
  const displayCategories = categoriesLoaded ? categories : [];

  // All accounts: skeleton during initial load, real data when loaded
  const accountsLoaded = !accountsLoading && Array.isArray(allAccounts);
  const displayAllAccounts = accountsLoaded ? allAccounts : [];

  // Group accounts by category
  const accountsByCategory = useMemo(() => {
    const grouped = {};
    displayAllAccounts.forEach((account) => {
      const catId = account.category?._id;
      if (catId) {
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(account);
      }
    });
    return grouped;
  }, [displayAllAccounts]);

  // Filter accounts based on selected category and filters
  const filteredAccounts = useMemo(() => {
    let result = displayAllAccounts;

    // Filter by category
    if (selectedCategory) {
      result = result.filter(account => account.category?._id === selectedCategory);
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      const priceRanges = {
        'under_50k': { min: 0, max: 50000 },
        '50k_100k': { min: 50000, max: 100000 },
        '100k_500k': { min: 100000, max: 500000 },
        'over_500k': { min: 500000, max: Infinity }
      };
      const range = priceRanges[filters.priceRange];
      if (range) {
        result = result.filter(acc => acc.price >= range.min && acc.price <= range.max);
      }
    }

    // Filter by search name
    if (filters.searchName) {
      result = result.filter(acc =>
        acc.title.toLowerCase().includes(filters.searchName.toLowerCase())
      );
    }

    // Filter by search code
    if (filters.searchCode) {
      result = result.filter(acc =>
        acc.code?.toLowerCase().includes(filters.searchCode.toLowerCase())
      );
    }

    // Sort
    if (filters.sortBy !== 'default') {
      const sorted = [...result];
      switch(filters.sortBy) {
        case 'price_asc':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          sorted.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name_desc':
          sorted.sort((a, b) => b.title.localeCompare(a.title));
          break;
        default:
          break;
      }
      return sorted;
    }

    return result;
  }, [selectedCategory, displayAllAccounts, filters]);

  // Handle category click with smooth scroll
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    // Scroll to accounts section after a short delay
    setTimeout(() => {
      accountsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filter handlers
  const handleApplyFilters = () => {
    setFilters(prev => ({
      ...prev,
      searchName: tempSearchName,
      searchCode: tempSearchCode,
    }));
    // Scroll to results
    setTimeout(() => {
      accountsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: 'all',
      sortBy: 'default',
      searchName: '',
      searchCode: '',
    });
    setTempSearchName('');
    setTempSearchCode('');
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Mua Bán Tài Khoản FC Online, FIFA Online 4 Giá Rẻ Uy Tín"
        description="Shop chuyên mua bán tài khoản FC Online (FIFA Online 4) giá rẻ, uy tín, chất lượng. Tài khoản FO4 đã có sẵn VPL, VLBD, cày rank, đủ mức giá, giao dịch nhanh, bảo hành an toàn."
        keywords="mua tai khoan fc online, fco, mua tai khoan fifa online 4, tai khoan fo4 gia re, ban tai khoan fc online, fifa online 4 gia re, fc online uy tin, tai khoan fo4 vpl, bp trang"
        type="website"
      />
      {/* Hero Section - Slider (or Stack when displayMode === 'stack') */}
      <section className="relative w-full" style={{ height: 'auto' }}>
        {sliders && sliders.length > 0 ? (
          (() => {
            const stackSliders = sliders.filter((s) => (s.displayMode ?? 'stack') === 'stack');
            const carouselSliders = sliders.filter((s) => (s.displayMode ?? 'stack') !== 'stack');

            return (
              <>
                {/* Stack mode: ảnh xếp dọc, full width, không Swiper, không title/subtitle/overlay */}
                {stackSliders.length > 0 && (
                  <div className="w-full flex flex-col gap-1">
                    {stackSliders.map((slider) => (
                      <a
                        key={slider._id}
                        href={slider.link || undefined}
                        target={slider.link ? '_blank' : undefined}
                        rel={slider.link ? 'noopener noreferrer' : undefined}
                        className="block w-full overflow-hidden rounded-md"
                      >
                        <img
                          src={slider.image}
                          alt={slider.title || ''}
                          className="block w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Carousel mode: Swiper như cũ */}
                {carouselSliders.length > 0 && (
                  <div className="w-full" style={{ height: '50vh', overflow: 'hidden' }}>
                    <Swiper
                      modules={[Autoplay, Pagination]}
                      autoplay={{ delay: 5000 }}
                      loop={true}
                      className="h-full"
                    >
                      {carouselSliders.map((slider) => (
                        <SwiperSlide key={slider._id}>
                          <div className="relative w-full h-full">
                            {/* Parallax Image */}
                            <div
                              className="absolute inset-0 w-full"
                              style={{
                                transform: `translateY(${scrollY * 0.3}px)`,
                                height: 'calc(50vh)',
                              }}
                            >
                              <img
                                src={slider.image}
                                alt={slider.title}
                                className="w-full h-full object-contain md:object-cover object-top"
                              />
                            </div>

                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            );
          })()
        ) : (
          /* Fallback: Static Banner */
          <div className="w-full bg-gradient-to-br from-primary-dark via-primary to-accent animate-gradient" style={{ minHeight: '40vh' }} />
        )}
      </section>

      {/* Content - starts below header */}
      <div className="pt-4">
        {/* Categories */}
        <section className="py-2">
          <div className="container-custom">
            <div className="section-title-banner">
              <span className="section-title-banner__text">
                <span className="accent">Danh mục</span> Game
              </span>
            </div>

            {/* Show skeleton while loading, real data when loaded, empty state if no categories */}
            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCategoryCard key={i} />
                ))}
              </div>
            ) : displayCategories.length === 0 ? (
              <div className="card text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Chưa có danh mục nào. Vui lòng quay lại sau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {displayCategories.map((category) => {
                  const count = (accountsByCategory[category._id] || []).length;
                  const isActive = selectedCategory === category._id;
                  return (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category._id)}
                      className={`category-card ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}`}
                    >
                      {category.thumbnail ? (
                        <img
                          src={category.thumbnail}
                          alt={category.name}
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-32 rounded-t-lg mb-2 bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold opacity-50">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-slate-900 dark:text-white text-sm font-semibold text-center">{category.name}</h3>

                      {/* Số tài khoản */}
                      <div className="category-count">
                        {count > 0 ? (
                          <>
                            <span className="category-count__num">{count}</span>
                            <span className="category-count__label">tài khoản</span>
                          </>
                        ) : (
                          <span className="category-count__label">Sắp có</span>
                        )}
                      </div>

                      {category.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-2">
          <div className="container-custom">
            <div className="card p-2">
              <div className="flex flex-wrap items-end gap-2">
                {/* Dropdown Khoảng giá */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Khoảng giá
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="input-field w-full text-sm py-1"
                  >
                    <option value="all">Tất cả</option>
                    <option value="under_50k">Dưới 50.000đ</option>
                    <option value="50k_100k">50.000đ - 100.000đ</option>
                    <option value="100k_500k">100.000đ - 500.000đ</option>
                    <option value="over_500k">Trên 500.000đ</option>
                  </select>
                </div>

                {/* Dropdown Sắp xếp */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sắp xếp
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="input-field w-full text-sm py-1"
                  >
                    <option value="default">Mặc định</option>
                    <option value="price_asc">Giá: Thấp → Cao</option>
                    <option value="price_desc">Giá: Cao → Thấp</option>
                    <option value="name_asc">Tên: A → Z</option>
                    <option value="name_desc">Tên: Z → A</option>
                  </select>
                </div>

                {/* Tìm kiếm tên */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tìm tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={tempSearchName}
                    onChange={(e) => setTempSearchName(e.target.value)}
                    placeholder="Nhập tên tài khoản..."
                    className="input-field w-full text-sm py-1"
                  />
                </div>

                {/* Mã tài khoản */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mã tài khoản
                  </label>
                  <input
                    type="text"
                    value={tempSearchCode}
                    onChange={(e) => setTempSearchCode(e.target.value)}
                    placeholder="VD: ACC123"
                    className="input-field w-full text-sm py-1"
                  />
                </div>

                {/* Nút Tìm kiếm */}
                <button
                  onClick={handleApplyFilters}
                  className="btn-primary px-3 py-1 text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <FiSearch className="w-3 h-3" />
                  <span>Tìm kiếm</span>
                </button>

                {/* Nút Hủy bỏ */}
                <button
                  onClick={handleResetFilters}
                  className="btn-secondary px-3 py-1 text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <FiX className="w-3 h-3" />
                  <span>Hủy bỏ</span>
                </button>
              </div>

              {/* Active filters indicator */}
              {(filters.priceRange !== 'all' || filters.sortBy !== 'default' || filters.searchName || filters.searchCode) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.priceRange !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      Giá: {filters.priceRange.replace('_', ' ')}
                    </span>
                  )}
                  {filters.sortBy !== 'default' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      Sắp xếp: {filters.sortBy.replace('_', ' ')}
                    </span>
                  )}
                  {filters.searchName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      Tên: "{filters.searchName}"
                    </span>
                  )}
                  {filters.searchCode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      Mã: "{filters.searchCode}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Filtered Accounts Section */}
      <section className="py-2" ref={accountsRef}>
        <div className="container-custom">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {selectedCategory ? (
                <>
                  {displayCategories.find(cat => cat._id === selectedCategory)?.thumbnail && (
                    <img
                      src={displayCategories.find(cat => cat._id === selectedCategory)?.thumbnail}
                      alt={displayCategories.find(cat => cat._id === selectedCategory)?.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  {displayCategories.find(cat => cat._id === selectedCategory)?.name}
                </>
              ) : (
                'Tất cả tài khoản'
              )}
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {filteredAccounts.length} tài khoản
            </div>
          </div>

          {/* Accounts Grid */}
          {accountsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="card text-center py-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Danh mục này chưa có tài khoản nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filteredAccounts.map((account) => (
                <AccountCard
                  key={account._id}
                  account={account}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-2">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary text-xl">⚡</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">Giao dịch nhanh</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Nhận tài khoản ngay sau khi thanh toán thành công
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary text-xl">🔒</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">Bảo mật cao</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Thông tin tài khoản được mã hóa và bảo vệ tuyệt đối
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary text-xl">💰</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">Giá tốt nhất</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Cam kết giá cả cạnh tranh và ưu đãi hấp dẫn
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
