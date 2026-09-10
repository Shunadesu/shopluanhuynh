import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSliders, useCategories, useAccountList, useHasSubcategories } from '../hooks';
import { FiChevronRight, FiChevronLeft, FiSearch, FiX } from 'react-icons/fi';
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

// Subcategory Grid Component
const SubcategoryGrid = ({ parentCategory, subcategories, onSelectSubcategory }) => {
  return (
    <section className="py-2">
      <div className="container-custom">
        {/* Header (no back button - click another category to switch) */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {parentCategory.thumbnail && (
              <img
                src={parentCategory.thumbnail}
                alt={parentCategory.name}
                className="w-6 h-6 rounded object-cover"
              />
            )}
            {parentCategory.name}
          </h2>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory._id}
              onClick={() => onSelectSubcategory(subcategory)}
              className="category-card"
            >
              {subcategory.thumbnail ? (
                <img
                  src={subcategory.thumbnail}
                  alt={subcategory.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-24 rounded-t-lg mb-2 bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold opacity-50">
                    {subcategory.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-slate-900 dark:text-white text-sm font-semibold text-center">
                {subcategory.name}
              </h3>
              {subcategory.description && (
                <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-1 line-clamp-2">
                  {subcategory.description}
                </p>
              )}
              <span className="category-count__label text-center block mt-1">
                Xem tài khoản
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// Category Section Component
const CategoryAccountSection = ({ category, accounts, isLoading, onSelectSubcategory, selectedSubcategoryId }) => {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  // Filter accounts by active subcategory
  const filteredAccounts = useMemo(() => {
    if (!activeSubcategory) return accounts;
    return accounts.filter(acc => acc.category?._id === activeSubcategory._id);
  }, [accounts, activeSubcategory]);

  const handleSubcategoryClick = (sub) => {
    const newSub = activeSubcategory?._id === sub._id ? null : sub;
    setActiveSubcategory(newSub);
    onSelectSubcategory?.(newSub);
  };

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
            {activeSubcategory && (
              <span className="text-sm font-normal text-primary">
                / {activeSubcategory.name}
              </span>
            )}
          </h2>
          <Link
            to={`/shop?category=${category._id}${activeSubcategory ? `&subcategory=${activeSubcategory._id}` : ''}`}
            className="text-primary hover:text-primary-light flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <span>Xem tất cả</span>
            <FiChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Subcategory Chips */}
        {hasSubcategories && (
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => handleSubcategoryClick(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                !activeSubcategory
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Tất cả ({accounts.length})
            </button>
            {category.subcategories.map((sub) => {
              const count = accounts.filter(acc => acc.category?._id === sub._id).length;
              if (count === 0) return null;
              return (
                <button
                  key={sub._id}
                  onClick={() => handleSubcategoryClick(sub)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    activeSubcategory?._id === sub._id
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state for subcategory */}
        {activeSubcategory && filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            Chưa có tài khoản trong danh mục con này
          </div>
        )}

        {/* Accounts Grid */}
        {filteredAccounts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {filteredAccounts.slice(0, 8).map((account) => (
              <AccountCard
                key={account._id}
                account={account}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [selectedParent, setSelectedParent] = useState(null); // Category cha đang chọn (để hiển thị subcategories)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // Danh mục con đang chọn (để lọc accounts)
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

  // Filter accounts based on selected subcategory and filters
  const filteredAccounts = useMemo(() => {
    let result = displayAllAccounts;

    // Filter by subcategory (only - parent selection just shows subcategory grid)
    if (selectedSubcategory) {
      result = result.filter(account => account.category?._id === selectedSubcategory._id);
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
  }, [selectedParent, selectedSubcategory, displayAllAccounts, filters]);

  // Handle category click - check if has subcategories
  const handleCategoryClick = (category) => {
    const hasSubs = category.subcategories && category.subcategories.length > 0;

    if (hasSubs) {
      // Có subcategories -> hiển thị grid subcategories
      setSelectedParent(category);
      setSelectedSubcategory(null);
      // Scroll to subcategory grid
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
      }, 100);
    } else {
      // Không có subcategory -> lọc accounts theo category này
      setSelectedParent(category);
      setSelectedSubcategory(null);
      // Scroll to accounts section
      setTimeout(() => {
        accountsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    // Scroll to accounts section
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
    <div className="min-h-screen pt-24">
      <SEOHead
        title="Mua Bán Tài Khoản FC Online, FIFA Online 4 Giá Rẻ Uy Tín"
        description="Shop chuyên mua bán tài khoản FC Online (FIFA Online 4) giá rẻ, uy tín, chất lượng. Tài khoản FO4 đã có sẵn VPL, VLBD, cày rank, đủ mức giá, giao dịch nhanh, bảo hành an toàn."
        keywords="mua tai khoan fc online, fco, mua tai khoan fifa online 4, tai khoan fo4 gia re, ban tai khoan fc online, fifa online 4 gia re, fc online uy tin, tai khoan fo4 vpl, bp trang"
        type="website"
      />
      {/* Hero Section - Banner 2 cột */}
      <section>
        {sliders && sliders.length > 0 ? (
          (() => {
            // Lấy 2 banner đầu tiên: [0] = trái, [1] = phải
            const leftBanner = sliders[0];
            const rightBanner = sliders[1] || sliders[0];

            // Chiều rộng cột trái từ banner đầu tiên (default 33%)
            const leftWidth = leftBanner.width ?? 33;
            const rightWidth = 100 - leftWidth;

            return (
              <div className="container-custom">
                <div
                  className="grid gap-1 rounded-md overflow-hidden"
                  style={{ gridTemplateColumns: `${leftWidth}fr ${rightWidth}fr` }}
                >
                  {/* Banner Trái */}
                  <div className="w-full overflow-hidden rounded-md">
                    {leftBanner.link ? (
                      <a href={leftBanner.link} target="_blank" rel="noopener noreferrer">
                        <img
                          src={leftBanner.image}
                          alt={leftBanner.title || 'Banner trái'}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={leftBanner.image}
                        alt={leftBanner.title || 'Banner trái'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Banner Phải */}
                  <div className="relative w-full overflow-hidden rounded-md">
                    {rightBanner.link ? (
                      <a href={rightBanner.link} target="_blank" rel="noopener noreferrer">
                        <img
                          src={rightBanner.image}
                          alt={rightBanner.title || 'Banner phải'}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={rightBanner.image}
                        alt={rightBanner.title || 'Banner phải'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* Fallback */
          <div className="container-custom">
            <div className="w-full bg-gradient-to-br from-primary-dark via-primary to-accent rounded-md" style={{ minHeight: '200px' }} />
          </div>
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

            {/* "Tất cả" button - reset to default view */}
            {(selectedParent || selectedSubcategory) && (
              <div className="mb-2">
                <button
                  onClick={() => {
                    setSelectedParent(null);
                    setSelectedSubcategory(null);
                  }}
                  className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1"
                >
                  <FiChevronRight className="w-4 h-4 rotate-180" />
                  <span>Tất cả danh mục</span>
                </button>
              </div>
            )}

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
                  const hasSubs = category.subcategories && category.subcategories.length > 0;
                  const isActive = selectedParent?._id === category._id;
                  return (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category)}
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
                        ) : hasSubs ? (
                          <span className="category-count__label">{category.subcategories.length} danh mục con</span>
                        ) : (
                          <span className="category-count__label">Sắp có</span>
                        )}
                      </div>

                      {category.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Icon hiển thị có subcategories */}
                      {hasSubs && (
                        <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-0.5 rounded-full">
                          {category.subcategories.length} danh mục
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Filter Bar - Chỉ hiển thị khi không chọn danh mục cha */}
        {!(selectedParent && !selectedSubcategory) && (
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
        )}
      </div>

      {/* Subcategory Grid - Hiển thị khi đã chọn category cha có danh mục con */}
      {selectedParent && !selectedSubcategory && selectedParent.subcategories?.length > 0 && (
        <SubcategoryGrid
          parentCategory={selectedParent}
          subcategories={selectedParent.subcategories}
          onSelectSubcategory={handleSubcategoryClick}
        />
      )}

      {/* Filtered Accounts Section - Chỉ hiển thị khi chọn danh mục con hoặc không chọn gì */}
      {!selectedParent || selectedSubcategory ? (
      <section className="py-2" ref={accountsRef}>
        <div className="container-custom">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {selectedSubcategory ? (
                <>
                  {selectedSubcategory.thumbnail && (
                    <img
                      src={selectedSubcategory.thumbnail}
                      alt={selectedSubcategory.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  {selectedSubcategory.name}
                  {/* Breadcrumb - click parent to go back to subcategory grid */}
                  {selectedParent && (
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className="text-xs text-primary hover:text-primary-light ml-2 flex items-center gap-1"
                    >
                      <FiChevronLeft className="w-3 h-3" />
                      <span>{selectedParent.name}</span>
                    </button>
                  )}
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
      ) : null}

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
