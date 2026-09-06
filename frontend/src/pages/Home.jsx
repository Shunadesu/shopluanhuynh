import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { FiShoppingCart, FiZap, FiArrowRight, FiTag, FiChevronRight } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

// Mock data for categories
const MOCK_CATEGORIES = [
  {
    _id: 'mock-1',
    name: 'Liên Quân Mobile',
    slug: 'lien-quan',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop',
    description: 'Game MOBA phổ biến nhất Việt Nam'
  },
  {
    _id: 'mock-2',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400&h=200&fit=crop',
    description: 'Game bắn súng sinh tồn hấp dẫn'
  },
  {
    _id: 'mock-3',
    name: 'Free Fire',
    slug: 'free-fire',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=200&fit=crop',
    description: 'Battle royale cực kỳ hot'
  },
  {
    _id: 'mock-4',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=200&fit=crop',
    description: 'Game nhập vai hành động open world'
  }
];

// Mock data for accounts with category info
const MOCK_ACCOUNTS = [
  {
    _id: 'mock-acc-1',
    title: 'Tài khoản Liên Quân Kim Cương 5000+',
    images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'],
    rank: 'Kim Cương',
    price: 350000,
    originalPrice: 500000,
    teamValue: '5000+',
    bp: '2500',
    category: { _id: 'mock-1', name: 'Liên Quân Mobile', slug: 'lien-quan' }
  },
  {
    _id: 'mock-acc-2',
    title: 'Tài khoản PUBG Royal Pass Mùa 20',
    images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400&h=300&fit=crop'],
    rank: 'Huyền Thoại',
    price: 450000,
    originalPrice: 600000,
    teamValue: 'Huyền Thoại',
    bp: '12000',
    category: { _id: 'mock-2', name: 'PUBG Mobile', slug: 'pubg-mobile' }
  },
  {
    _id: 'mock-acc-3',
    title: 'Tài khoản Free Fire Đặc Cấp',
    images: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop'],
    rank: 'Đặc Cấp',
    price: 280000,
    originalPrice: 350000,
    teamValue: 'Đặc Cấp',
    bp: '1800',
    category: { _id: 'mock-3', name: 'Free Fire', slug: 'free-fire' }
  },
  {
    _id: 'mock-acc-4',
    title: 'Tài khoản Genshin AR 55 + 5 Nhân vật 5*',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'],
    rank: 'AR 55',
    price: 1200000,
    originalPrice: 1500000,
    teamValue: 'AR 55',
    bp: '50000',
    category: { _id: 'mock-4', name: 'Genshin Impact', slug: 'genshin-impact' }
  },
  {
    _id: 'mock-acc-5',
    title: 'Tài khoản Liên Quân王者 100 Trang Phục',
    images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'],
    rank: '王者',
    price: 890000,
    originalPrice: 1100000,
    teamValue: '王者',
    bp: '5000',
    category: { _id: 'mock-1', name: 'Liên Quân Mobile', slug: 'lien-quan' }
  },
  {
    _id: 'mock-acc-6',
    title: 'Tài khoản Liên Quân Cao Thủ',
    images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'],
    rank: 'Cao Thủ',
    price: 520000,
    originalPrice: 700000,
    teamValue: 'Cao Thủ',
    bp: '3200',
    category: { _id: 'mock-1', name: 'Liên Quân Mobile', slug: 'lien-quan' }
  },
  {
    _id: 'mock-acc-7',
    title: 'Tài khoản PUBG Mùa 21 - Huy Chương',
    images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400&h=300&fit=crop'],
    rank: 'Huy Chương',
    price: 380000,
    originalPrice: 480000,
    teamValue: 'Huy Chương',
    bp: '8500',
    category: { _id: 'mock-2', name: 'PUBG Mobile', slug: 'pubg-mobile' }
  },
  {
    _id: 'mock-acc-8',
    title: 'Tài khoản Free Fire Nick Tài Nguyên',
    images: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop'],
    rank: 'Kim Cương VIP',
    price: 420000,
    originalPrice: 550000,
    teamValue: 'Kim Cương',
    bp: '2200',
    category: { _id: 'mock-3', name: 'Free Fire', slug: 'free-fire' }
  },
  {
    _id: 'mock-acc-9',
    title: 'Tài khoản Liên Quân Tướng Mạnh',
    images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'],
    rank: 'Tinh Anh',
    price: 650000,
    originalPrice: 800000,
    teamValue: 'Tinh Anh',
    bp: '4500',
    category: { _id: 'mock-1', name: 'Liên Quân Mobile', slug: 'lien-quan' }
  },
  {
    _id: 'mock-acc-10',
    title: 'Tài khoản Genshin AR 50 Full Nhân Vật',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'],
    rank: 'AR 50',
    price: 950000,
    originalPrice: 1200000,
    teamValue: 'AR 50',
    bp: '35000',
    category: { _id: 'mock-4', name: 'Genshin Impact', slug: 'genshin-impact' }
  },
  {
    _id: 'mock-acc-11',
    title: 'Tài khoản PUBG Prime Mùa 22',
    images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400&h=300&fit=crop'],
    rank: 'Ace',
    price: 520000,
    originalPrice: 680000,
    teamValue: 'Ace',
    bp: '10000',
    category: { _id: 'mock-2', name: 'PUBG Mobile', slug: 'pubg-mobile' }
  },
  {
    _id: 'mock-acc-12',
    title: 'Tài khoản Free Fire Sự Kiện Mới',
    images: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop'],
    rank: 'Đại Sự Gia',
    price: 350000,
    originalPrice: 450000,
    teamValue: 'Đại Sự Gia',
    bp: '1500',
    category: { _id: 'mock-3', name: 'Free Fire', slug: 'free-fire' }
  }
];

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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setCartCount, incrementCart } = useCartStore();
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
  const { data: sliders } = useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const res = await api.get('/settings/sliders');
      return res.data;
    }
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // Fetch all accounts (for grouping by category)
  const { data: allAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts?limit=100');
      return res.data.accounts;
    }
  });

  // Fetch featured accounts (limit 8)
  const { data: featuredAccounts } = useQuery({
    queryKey: ['featured-accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts?limit=8');
      return res.data.accounts;
    }
  });

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
    
    api.post('/orders/cart/add', { accountId: account._id }).then(() => {
      queryClient.invalidateQueries(['cart']);
      navigate('/checkout');
    }).catch((error) => {
      toast.error(error.response?.data?.message || 'Không thể xử lý');
    });
  };

  // Determine data to display
  const displayCategories = categories?.length > 0 ? categories : MOCK_CATEGORIES;
  const showCategoriesSkeleton = categoriesLoading && categories?.length === undefined;

  const displayAllAccounts = allAccounts?.length > 0 ? allAccounts : MOCK_ACCOUNTS;
  const displayFeaturedAccounts = featuredAccounts?.length > 0 
    ? featuredAccounts.slice(0, 8) 
    : MOCK_ACCOUNTS.slice(0, 8);
  const showAccountsSkeleton = accountsLoading && allAccounts?.length === undefined;

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
  const hasMoreAccounts = (displayAllAccounts.length) > 8;

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Mua Bán Tài Khoản Game Giá Rẻ Uy Tín"
        description="Cung cấp tài khoản game giá rẻ, uy tín, chất lượng. Mua bán tài khoản Liên Quân, PUBG, Free Fire, Genshin Impact và nhiều game khác."
        keywords="mua tai khoan game, tai khoan game gia re, ban tai khoan, lien quan mobile, pubg mobile, free fire"
        type="website"
      />
      {/* Hero Section - Slider */}
      <section className="relative" style={{ height: '100vh', overflow: 'hidden' }}>
        {sliders && sliders.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000 }}
            // pagination={{ clickable: true }}
            loop={true}
            className="h-full"
          >
            {sliders.map((slider) => (
              <SwiperSlide key={slider._id}>
                <div className="relative w-full h-full">
                  {/* Parallax Image */}
                  <div
                    className="absolute inset-0 w-full"
                    style={{
                      transform: `translateY(${scrollY * 0.3}px)`,
                      height: 'calc(100vh)',
                      // marginTop: '-100px'
                    }}
                  >
                    <img
                      src={slider.image}
                      alt={slider.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent dark:from-dark dark:via-dark/30" />
                  {/* Content */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="container-custom pb-16">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        {slider.title}
                      </h2>
                      {slider.subtitle && (
                        <p className="text-lg text-slate-200 mb-4 max-w-2xl drop-shadow">
                          {slider.subtitle}
                        </p>
                      )}
                      {slider.link && (
                        <Link to={slider.link} className="btn-primary text-lg px-6 py-3">
                          Khám phá ngay
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          /* Fallback: Static Banner */
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent animate-gradient" />
        )}
      </section>

      {/* Content - starts below header */}
      <div className="pt-16">
        {/* Categories */}
        <section className="py-4">
          <div className="container-custom">
            <div className="flex items-center justify-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">Danh mục game</h2>
            </div>
            
            {/* Show skeleton if loading, otherwise show data */}
            {showCategoriesSkeleton ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCategoryCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayCategories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/shop?category=${category._id}`}
                    className="category-card"
                  >
                    {category.thumbnail ? (
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full h-32 object-cover rounded-t-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-t-lg mb-4 bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-50">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-slate-900 dark:text-white font-semibold text-center">{category.name}</h3>
                    {category.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Featured Accounts */}
      <section className="py-4">
        <div className="container-custom">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">Tài khoản nổi bật</h2>
          </div>
          
          {/* Show skeleton if loading, otherwise show data */}
          {showAccountsSkeleton ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonAccountCard key={i} />
              ))}
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
                    addToCartPending={addToCartMutation.isPending}
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

      {/* Category Sections - One for each category with accounts */}
      {displayCategories.map((category) => {
        const categoryAccounts = accountsByCategory[category._id];
        if (!categoryAccounts || categoryAccounts.length === 0) return null;
        
        return (
          <CategoryAccountSection
            key={category._id}
            category={category}
            accounts={categoryAccounts.slice(0, 4)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            addToCartPending={addToCartMutation.isPending}
            isLoading={showAccountsSkeleton}
          />
        );
      })}

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
