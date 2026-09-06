import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { FiShoppingCart, FiTag, FiImage, FiChevronDown, FiChevronUp, FiZoomIn, FiX } from 'react-icons/fi';
import { useState, useEffect, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import { AccountDetailSkeleton, AccountGallerySkeleton } from '../components/SkeletonLoader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

// Normalize image value (object → url string)
const resolveUrl = (img) =>
  typeof img === 'string' ? img : (img?.url || img?.localUrl || '');

const AccountDetail = ({ onOpenAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { incrementCart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const res = await api.get(`/accounts/${id}`);
      return res.data;
    }
  });

  // ESC to close lightbox + lock body scroll
  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') setLightboxOpen(false); };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [lightboxOpen]);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/orders/cart/add', { accountId: id });
      return res.data;
    },
    onSuccess: () => {
      incrementCart();
      toast.success('Đã thêm vào giỏ hàng');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        onOpenAuth?.('login');
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      }
    }
  });

  // ─── Related / Random Accounts ───────────────────────────
  const { data: relatedData } = useQuery({
    queryKey: ['related-accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts?limit=20');
      return res.data;
    },
    enabled: !!account,
  });

  const relatedAccounts = useMemo(() => {
    const all = (relatedData?.accounts || []).filter(
      (a) => a._id !== account?._id && a.status === 'available',
    );
    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 4);
  }, [relatedData, account?._id]);

  const handleAddToCart = () => {
    if (account.status !== 'available') {
      toast.error('Tài khoản không còn khả dụng');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (account.status !== 'available') {
      toast.error('Tài khoản không còn khả dụng');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua ngay');
      onOpenAuth?.('login');
      sessionStorage.setItem('buyNowAccount', JSON.stringify({ accountId: id }));
      return;
    }
    addToCartMutation.mutate(undefined, {
      onSuccess: () => navigate('/cart'),
    });
  };

  if (isLoading) return <AccountDetailSkeleton />;

  if (!account) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <p className="text-slate-400">Không tìm thấy tài khoản</p>
      </div>
    );
  }

  const images = (account.images || [])
    .map(resolveUrl)
    .filter(Boolean);
  const heroImage = images[selectedImage] || '/placeholder.jpg';

  const discountPct = account.originalPrice && account.originalPrice > account.price
    ? Math.round((1 - account.price / account.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <SEOHead
        title={account?.title || 'Chi Tiết Tài Khoản'}
        description={`Mua tài khoản ${account?.title} - Rank ${account?.rank} với giá chỉ ${account?.price?.toLocaleString('vi-VN')}đ. Tài khoản game chất lượng cao, bảo mật.`}
        keywords={`mua tai khoan ${account?.categoryId?.name || 'game'}, tai khoan ${account?.rank || 'game'}, ${account?.title}`}
        ogImage={account?.images?.[0]}
        type="product"
      />
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-6">
          <span
            className="hover:text-primary cursor-pointer transition-colors"
            onClick={() => navigate('/')}
          >
            Trang chủ
          </span>
          {' / '}
          <span
            className="hover:text-primary cursor-pointer transition-colors"
            onClick={() => navigate('/shop')}
          >
            Cửa hàng
          </span>
          {account.categoryId && (
            <>
              {' / '}
              <span
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/shop/${account.categoryId.slug}`)}
              >
                {account.categoryId.name}
              </span>
            </>
          )}
          {' / '}
          <span className="text-white">{account.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-stretch">
          {/* Images */}
          <div>
            {/* Hero image with title/category overlay */}
            <div className="card p-2 mb-4 relative group">
              <img
                src={heroImage}
                alt={account.title}
                className="w-full h-96 object-cover rounded-lg cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg pointer-events-none">
                <FiZoomIn className="text-white text-4xl drop-shadow-lg" />
              </div>

              {/* Title + Category overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 rounded-b-lg">
                {account.categoryId && (
                  <span className="inline-block bg-primary/90 text-white text-xs font-bold px-2.5 py-0.5 rounded mb-2 tracking-wide">
                    {account.categoryId.name}
                  </span>
                )}
                <h1 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
                  {account.title}
                </h1>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx
                        ? 'border-primary'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info — wrapped in animated orange border, stretches full height */}
          <div className="flex flex-col min-h-full">
            <div className="info-card-glow flex flex-col min-h-full flex-1">
              <div className="info-card-glow-inner space-y-4 flex flex-col flex-1">

                {/* Status Badge */}
                {account.status === 'sold' && (
                  <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-center font-semibold">
                    TÀI KHOẢN ĐÃ BÁN
                  </div>
                )}

                {/* Account Name */}
                <h1 className="text-2xl font-black text-white">{account.title}</h1>

                {/* Price section — enhanced */}
                <div className="bg-slate-800/80 rounded-xl p-5 border border-primary/25">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-slate-400 text-sm">Giá gốc</p>
                      {account.originalPrice && account.originalPrice > account.price ? (
                        <p className="text-slate-500 text-xl line-through">
                          {account.originalPrice.toLocaleString('vi-VN')}đ
                        </p>
                      ) : (
                        <p className="text-slate-600 text-xl">—</p>
                      )}
                    </div>
                    {discountPct && (
                      <div className="bg-gradient-to-r from-primary to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg shadow-primary/30">
                        -{discountPct}%
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm mb-1">Giá bán</p>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 font-black text-4xl drop-shadow-lg">
                      {account.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                {/* Stats: teamValue (horizontal) + BP (below) */}
                {(account.teamValue || account.bp) && (
                  <div className="bg-gradient-to-br from-primary/15 to-orange-500/5 border border-primary/30 rounded-xl p-4 space-y-3">
                    {account.teamValue && (
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-sm uppercase tracking-wider">Giá trị đội hình</span>
                        <span className="text-white font-bold text-lg">{account.teamValue}</span>
                      </div>
                    )}
                    {account.bp && (
                      <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                        <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">BP</span>
                        <span className="text-white font-bold text-lg">{account.bp}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {account.description && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Mô tả</h3>
                    <p className="text-slate-400 whitespace-pre-line">
                      {account.description}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                {account.additionalInfo && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Thông tin thêm</h3>
                    <p className="text-slate-400 whitespace-pre-line">
                      {account.additionalInfo}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {account.status === 'available' ? (
                    <>
                      <button
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart />
                        <span>
                          {addToCartMutation.isPending
                            ? 'Đang xử lý...'
                            : 'Thêm vào giỏ hàng'}
                        </span>
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={addToCartMutation.isPending}
                        className="btn-secondary flex-1"
                      >
                        Mua ngay
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="btn-secondary w-full cursor-not-allowed opacity-50"
                    >
                      Không khả dụng
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ─── Hình ảnh chi tiết ─── */}
        {images.length > 0 && (
          <div className="mt-8">
            {/* Toggle header */}
            <button
              onClick={() => setGalleryOpen((o) => !o)}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-4 rounded-xl transition-colors mb-4"
            >
              <div className="flex items-center gap-3">
                <FiImage className="text-cyan-400 text-xl" />
                <div className="text-left">
                  <h2 className="text-white font-semibold text-base">
                    Hình ảnh chi tiết
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {images.length} hình
                  </p>
                </div>
              </div>
              {galleryOpen ? (
                <FiChevronUp className="text-slate-400" />
              ) : (
                <FiChevronDown className="text-slate-400" />
              )}
            </button>

            {/* Gallery grid */}
            {galleryOpen && (
              <div className="space-y-4 animate-fade-in">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700"
                  >
                    <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                      {idx + 1} / {images.length}
                    </div>
                    <img
                      src={url}
                      alt={`Hình ${idx + 1}`}
                      className="w-full object-contain max-h-[600px]"
                      style={{ background: '#0f172a' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Related Accounts ─── */}
        {relatedAccounts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Tài khoản bạn có thể thích
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedAccounts.map((acc) => (
                <Link
                  key={acc._id}
                  to={`/account/${acc._id}`}
                  className="card p-3 group"
                >
                  <img
                    src={acc.images?.[0] || '/placeholder.jpg'}
                    alt={acc.title}
                    className="w-full h-36 object-cover rounded-lg mb-3 group-hover:opacity-80 transition-opacity"
                  />
                  <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">
                    {acc.title}
                  </h3>
                  <p className="text-primary font-bold">
                    {acc.price.toLocaleString('vi-VN')}đ
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }

        /* Info card always-on animated orange border */
        .info-card-glow {
          position: relative;
          background: #1a2537;
          border-radius: 16px;
          padding: 2px;
          overflow: hidden;
        }
        .info-card-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(90deg, #D84315, #FF6D00, #FFAB40, #D84315);
          background-size: 300% 100%;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-flow 2s linear infinite;
          pointer-events: none;
        }
        .info-card-glow-inner {
          background: #1a2537;
          border-radius: 14px;
          padding: 24px;
        }
        @keyframes border-flow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>

      {/* ─── Lightbox Modal ─── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/60 shrink-0">
            <p className="text-white font-medium">
              {selectedImage + 1} / {images.length}
            </p>
            <button
              onClick={() => setLightboxOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <FiX size={28} />
            </button>
          </div>

          {/* Swiper */}
          <div
            className="flex-1 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Swiper
              modules={[Pagination, Zoom]}
              zoom={{ maxRatio: 3 }}
              pagination={{ clickable: true }}
              initialSlide={selectedImage}
              onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
              className="!w-full !h-full [&_.swiper]:h-full [&_.swiper-slide]:flex [&_.swiper-slide]:items-center [&_.swiper-slide]:justify-center [&_.swiper-pagination]:!bottom-4"
            >
              {images.map((url, idx) => (
                <SwiperSlide key={idx}>
                  <div className="swiper-zoom-container">
                    <img
                      src={url}
                      alt={`Hình ${idx + 1}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: 'calc(100vh - 120px)' }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetail;
