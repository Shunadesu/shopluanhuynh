import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useSliders, useCategories, useAccountList } from '../hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FiShoppingCart, FiZap, FiArrowRight, FiTag, FiChevronRight } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

// Skeleton loader components
const SkeletonCategoryCard = () => (
  <div className="card animate-pulse">
    <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-t-lg mb-4" />
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
  </div>
);

const SkeletonAccountCard = () => (
  <div className="card animate-pulse">
    <div className="w-full h-40 sm:h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-24" />
    </div>
  </div>
);

// Account Card Component
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
            <span className="text-slate-500 dark:text-slate-500 text-xs line-through">
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
            disabled={addToCartPending}
            className="w-full btn-secondary flex items-center justify-center gap-1 py-2 text-xs sm:text-sm"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Giỏ hàng</span>
          </button>
          <button
            onClick={(e) => onBuyNow(e, account)}
            className="w-full btn-primary flex items-center justify-center gap-1 py-2 text-xs sm:text-sm"
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
const CategoryAccountSection = ({ category, accounts, onAddToCart, onBuyNow, addToCartPending, isLoading }) => {
  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonAccountCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!accounts || accounts.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const incrementCart = useCartStore((s) => s.incrementCart);
  const [scrollY, setScrollY] = useState(0);

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

  // Fetch featured accounts (limit 8)
  const { accounts: featuredAccounts } = useAccountList({ limit: 8 });

  // Add to cart (via store)
  const [addToCartPending, setAddToCartPending] = useState(false);

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

  // Handle buy now
  const handleBuyNow = async (e, account) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }));
      sessionStorage.setItem('buyNowAccount', JSON.stringify(account));
      return;
    }

    try {
      await useCartStore.getState().addToCartAdd(account._id);
      navigate('/checkout');
    } catch (error) {
      if (error?.__skipped || error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để mua ngay');
      } else {
        toast.error(error.response?.data?.message || 'Không thể xử lý');
      }
    }
  };

  // Determine data to display
  // Categories: skeleton during initial load, real data when loaded, empty state when no data
  const categoriesLoaded = !categoriesLoading && Array.isArray(categories);
  const displayCategories = categoriesLoaded ? categories : [];

  // Featured accounts: skeleton during initial load, real data when loaded
  const accountsLoaded = !accountsLoading && Array.isArray(allAccounts);
  const displayAllAccounts = accountsLoaded ? allAccounts : [];
  const displayFeaturedAccounts = accountsLoaded ? (featuredAccounts || []).slice(0, 8) : [];
  const showAccountsSkeleton = accountsLoading && !accountsLoaded;

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

  // Check if there are more accounts
  const hasMoreAccounts = displayAllAccounts.length > 8;

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
                  <div className="w-full flex flex-col gap-3 sm:gap-4">
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
                  <div className="w-full" style={{ height: '70vh', overflow: 'hidden' }}>
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
                                height: 'calc(70vh)',
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
          <div className="w-full bg-gradient-to-br from-primary-dark via-primary to-accent animate-gradient" style={{ minHeight: '60vh' }} />
        )}
      </section>

      {/* Content - starts below header */}
      <div className="pt-16">
        {/* Categories */}
        <section className="py-4">
          <div className="container-custom">
            <div className="section-title-banner">
              <span className="section-title-banner__text">
                <span className="accent">Danh mục</span> Game
              </span>
            </div>
            
            {/* Show skeleton while loading, real data when loaded, empty state if no categories */}
            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCategoryCard key={i} />
                ))}
              </div>
            ) : displayCategories.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  Chưa có danh mục nào. Vui lòng quay lại sau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayCategories.map((category) => {
                  const count = (accountsByCategory[category._id] || []).length;
                  return (
                    <Link
                      key={category._id}
                      to={`/shop?category=${category._id}`}
                      className="category-card"
                    >
                      {category.thumbnail ? (
                        <img
                          src={category.thumbnail}
                          alt={category.name}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-32 rounded-t-lg mb-4 bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-50">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-slate-900 dark:text-white font-semibold text-center">{category.name}</h3>

                      {/* NEW: số tài khoản */}
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
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* NEW: nút Xem ngay */}
                      <span className="category-cta">
                        Xem ngay 
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Featured Accounts */}
      <section className="py-4">
        <div className="container-custom">
          <div className="section-title-banner">
            <span className="section-title-banner__text">
              <span className="accent">Tài khoản</span> Nổi bật
            </span>
          </div>
          
          {/* Show skeleton while loading; show real data when loaded; show empty state if no accounts */}
          {showAccountsSkeleton ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonAccountCard key={i} />
              ))}
            </div>
          ) : displayFeaturedAccounts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                Chưa có tài khoản nổi bật. Vui lòng quay lại sau.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: 4 columns, Mobile: 2 columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayFeaturedAccounts.map((account) => (
                  <AccountCard
                    key={account._id}
                    account={account}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    addToCartPending={addToCartPending}
                  />
                ))}
              </div>

              {/* View More Button */}
              {hasMoreAccounts && (
                <div className="flex justify-center mt-8">
                  <Link
                    to="/shop"
                    className="btn-secondary px-8 py-3 flex items-center gap-2 text-base hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    <span>Xem tất cả tài khoản</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Category Sections - One for each category with accounts.
          - While categories are loading: show a few skeleton placeholders.
          - After load: render real sections for categories that have accounts. */}
      {categoriesLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <CategoryAccountSection
              key={`skeleton-${i}`}
              category={{ _id: `skeleton-${i}`, name: '' }}
              accounts={[]}
              isLoading
            />
          ))}
        </>
      ) : (
        displayCategories.map((category) => {
          const categoryAccounts = accountsByCategory[category._id];
          if (!categoryAccounts || categoryAccounts.length === 0) return null;

          return (
            <CategoryAccountSection
              key={category._id}
              category={category}
              accounts={categoryAccounts.slice(0, 4)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addToCartPending={addToCartPending}
            />
          );
        })
      )}

      {/* Features */}
      <section className="py-4">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">⚡</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-xl mb-2">Giao dịch nhanh</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Nhận tài khoản ngay sau khi thanh toán thành công
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">🔒</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-xl mb-2">Bảo mật cao</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Thông tin tài khoản được mã hóa và bảo vệ tuyệt đối
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">💰</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-xl mb-2">Giá tốt nhất</h3>
              <p className="text-slate-600 dark:text-slate-400">
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
