import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import Loading from '../components/Loading';
import { FiShoppingCart, FiTag, FiServer } from 'react-icons/fi';
import { useState } from 'react';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { incrementCart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch account detail
  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const res = await api.get(`/accounts/${id}`);
      return res.data;
    }
  });

  // Add to cart mutation
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
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    if (account.status !== 'available') {
      toast.error('Tài khoản không còn khả dụng');
      return;
    }

    addToCartMutation.mutate();
  };

  if (isLoading) return <Loading />;

  if (!account) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <p className="text-slate-400">Không tìm thấy tài khoản</p>
      </div>
    );
  }

  const images = account.images && account.images.length > 0 
    ? account.images 
    : ['/placeholder.jpg'];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-6">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>
            Trang chủ
          </span>
          {' / '}
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/shop')}>
            Cửa hàng
          </span>
          {account.categoryId && (
            <>
              {' / '}
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate(`/shop/${account.categoryId.slug}`)}>
                {account.categoryId.name}
              </span>
            </>
          )}
          {' / '}
          <span className="text-white">{account.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Images */}
          <div>
            <div className="card p-2 mb-4">
              <img
                src={images[selectedImage] || '/placeholder.jpg'}
                alt={account.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="card">
              {/* Status Badge */}
              {account.status === 'sold' && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-center font-semibold">
                  TÀI KHOẢN ĐÃ BÁN
                </div>
              )}

              <h1 className="text-3xl font-bold text-white mb-4">{account.title}</h1>

              {/* Category */}
              {account.categoryId && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm">
                    {account.categoryId.name}
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {account.rank && (
                  <div className="flex items-center space-x-2 bg-primary/20 text-primary px-3 py-2 rounded-lg">
                    <FiTag />
                    <span>{account.rank}</span>
                  </div>
                )}
                {account.server && (
                  <div className="flex items-center space-x-2 bg-slate-700 text-slate-300 px-3 py-2 rounded-lg">
                    <FiServer />
                    <span>{account.server}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="bg-dark-lighter p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Giá bán</p>
                    {account.originalPrice && account.originalPrice > account.price && (
                      <p className="text-slate-500 text-lg line-through">
                        {account.originalPrice.toLocaleString('vi-VN')}đ
                      </p>
                    )}
                    <p className="text-primary font-bold text-3xl">
                      {account.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  {account.originalPrice && account.originalPrice > account.price && (
                    <div className="bg-primary text-white px-3 py-1 rounded-lg font-semibold">
                      -{Math.round((1 - account.price / account.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {account.description && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2">Mô tả</h3>
                  <p className="text-slate-400 whitespace-pre-line">{account.description}</p>
                </div>
              )}

              {/* Additional Info */}
              {account.additionalInfo && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2">Thông tin thêm</h3>
                  <p className="text-slate-400 whitespace-pre-line">{account.additionalInfo}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {account.status === 'available' ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      <FiShoppingCart />
                      <span>
                        {addToCartMutation.isPending ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart();
                        setTimeout(() => navigate('/cart'), 500);
                      }}
                      disabled={addToCartMutation.isPending}
                      className="btn-secondary w-full"
                    >
                      Mua ngay
                    </button>
                  </>
                ) : (
                  <button disabled className="btn-secondary w-full cursor-not-allowed opacity-50">
                    Không khả dụng
                  </button>
                )}
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">
                  ℹ️ Thông tin tài khoản (username, password) sẽ được hiển thị sau khi thanh toán thành công
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
