import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import Loading from '../components/Loading';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCartCount } = useCartStore();

  // Fetch cart
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/orders/cart');
      return res.data;
    },
    onSuccess: (data) => {
      setCartCount(data.items?.length || 0);
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (accountId) => {
      const res = await api.delete(`/orders/cart/${accountId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Đã xóa khỏi giỏ hàng');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
    }
  });

  const handleRemove = (accountId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      removeFromCartMutation.mutate(accountId);
    }
  };

  if (isLoading) return <Loading />;

  const items = cartData?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-white mb-8">Giỏ hàng</h1>
          <div className="card text-center py-20">
            <FiShoppingBag className="w-20 h-20 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
            <Link to="/shop" className="btn-primary inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-white mb-8">Giỏ hàng ({items.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2">
            {items.map((item) => (
              <div key={item._id} className="card">
                <div className="flex gap-2">
                  {/* Image */}
                  <Link to={`/account/${item._id}`} className="flex-shrink-0">
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-grow">
                    <Link to={`/account/${item._id}`}>
                      <h3 className="text-white font-semibold mb-2 hover:text-primary line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.rank && (
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                          {item.rank}
                        </span>
                      )}
                      {item.server && (
                        <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                          {item.server}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-slate-500 text-sm line-through">
                            {item.originalPrice.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                        <p className="text-primary font-bold text-xl">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removeFromCartMutation.isPending}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Tổng đơn hàng</h2>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-slate-400">
                  <span>Số lượng sản phẩm:</span>
                  <span>{items.length}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-xl">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full"
              >
                Thanh toán
              </button>

              <Link to="/shop" className="btn-secondary w-full mt-3">
                Tiếp tục mua sắm
              </Link>

              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">
                  ℹ️ Thanh toán bằng số dư tài khoản. Vui lòng nạp tiền trước khi thanh toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
