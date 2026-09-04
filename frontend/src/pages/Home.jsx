import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Home = () => {
  // Fetch sliders
  const { data: sliders } = useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const res = await api.get('/settings/sliders');
      return res.data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  // Fetch featured accounts
  const { data: accounts } = useQuery({
    queryKey: ['featured-accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts?limit=8');
      return res.data.accounts;
    }
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Slider */}
      {sliders && sliders.length > 0 && (
        <section className="mb-2">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            loop={true}
            className="h-64 md:h-96"
          >
            {sliders.map((slider) => (
              <SwiperSlide key={slider._id}>
                <div className="relative w-full h-full">
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent flex items-end">
                    <div className="container-custom pb-4">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        {slider.title}
                      </h2>
                      {slider.link && (
                        <Link to={slider.link} className="btn-primary">
                          Khám phá ngay
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Hero Section */}
      <section className="py-4 bg-gradient-to-br from-primary-dark/20 to-primary/10">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Chào mừng đến với <span className="text-primary">Shopluanhuynh</span>
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Cung cấp tài khoản game chất lượng cao với giá cả hợp lý. Giao dịch nhanh chóng, bảo mật tuyệt đối.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/shop" className="btn-primary text-lg px-4 py-2">
                Mua ngay
              </Link>
              <Link to="/deposit" className="btn-secondary text-lg px-4 py-2">
                Nạp tiền
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-4">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-white mb-8">Danh mục game</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/shop/${category.slug}`}
                  className="card hover:scale-105 transition-transform"
                >
                  {category.thumbnail && (
                    <img
                      src={category.thumbnail}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-t-lg mb-4"
                    />
                  )}
                  <h3 className="text-white font-semibold text-center">{category.name}</h3>
                  {category.description && (
                    <p className="text-slate-400 text-sm text-center mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Accounts */}
      {accounts && accounts.length > 0 && (
        <section className="py-4 bg-dark-lighter">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-white">Tài khoản nổi bật</h2>
              <Link to="/shop" className="text-primary hover:text-primary-light">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {accounts.map((account) => (
                <Link
                  key={account._id}
                  to={`/account/${account._id}`}
                  className="card hover:scale-105 transition-transform"
                >
                  <img
                    src={account.images?.[0] || '/placeholder.jpg'}
                    alt={account.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {account.title}
                  </h3>
                  {account.rank && (
                    <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded text-sm mb-2">
                      {account.rank}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    {account.originalPrice && account.originalPrice > account.price && (
                      <span className="text-slate-500 text-sm line-through">
                        {account.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    <span className="text-primary font-bold text-xl ml-auto">
                      {account.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-4">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Giao dịch nhanh</h3>
              <p className="text-slate-400">
                Nhận tài khoản ngay sau khi thanh toán thành công
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">🔒</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Bảo mật cao</h3>
              <p className="text-slate-400">
                Thông tin tài khoản được mã hóa và bảo vệ tuyệt đối
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">💰</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Giá tốt nhất</h3>
              <p className="text-slate-400">
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
