import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import Loading from '../components/Loading';
import { FiCheckCircle } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  // Fetch cart
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/orders/cart');
      return res.data;
    }
  });

  // Fetch user info for balance
  const { data: userData } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/orders/checkout');
      return res.data;
    },
    onSuccess: (data) => {
      clearCart();
      toast.success('Thanh toán thành công!');
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['user-me']);
      queryClient.invalidateQueries(['orders']);
      navigate(`/profile/orders/${data.order._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thanh toán thất bại');
    }
  });

  if (cartLoading) return <Loading />;

  const items = cartData?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const balance = userData?.balance || 0;
  const insufficientBalance = balance < totalAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <SEOHead
          title="Giỏ hàng trống"
          description="Giỏ hàng của bạn đang trống. Hãy tiếp tục mua sắm tài khoản game chất lượng cao tại Shop Luan Huỳnh."
          type="website"
        />
        <div className="container-custom">
          <div className="card text-center py-20">
            <p className="text-slate-400 text-lg mb-6">Giỏ hàng trống</p>
            <button onClick={() => navigate('/shop')} className="btn-primary">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <SEOHead
        title="Thanh toán"
        description={`Thanh toán ${items.length} tài khoản game với tổng cộng ${totalAmount.toLocaleString('vi-VN')}đ tại Shop Luan Huỳnh.`}
        type="website"
      />
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-white mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Đơn hàng của bạn</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-2 pb-2 border-b border-slate-700 last:border-0">
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <h3 className="text-white font-semibold mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.rank && (
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                            {item.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-primary font-bold">
                        {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Phương thức thanh toán</h2>
              <div className="bg-slate-800 border border-primary rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-white font-semibold">Số dư tài khoản</p>
                      <p className="text-slate-400 text-sm">
                        Số dư hiện tại: <span className="text-primary font-semibold">
                          {balance.toLocaleString('vi-VN')}đ
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-slate-400">
                  <span>Số lượng sản phẩm:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tổng tiền:</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-xl">
                  <span>Thanh toán:</span>
                  <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Balance Info */}
              <div className={`p-4 rounded-lg mb-6 ${
                insufficientBalance ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'
              }`}>
                <p className={insufficientBalance ? 'text-red-400' : 'text-green-400'}>
                  Số dư hiện tại: {balance.toLocaleString('vi-VN')}đ
                </p>
                {insufficientBalance && (
                  <>
                    <p className="text-red-400 text-sm mt-1">
                      Thiếu: {(totalAmount - balance).toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-red-400 text-sm mt-2">
                      ⚠️ Số dư không đủ để thanh toán
                    </p>
                  </>
                )}
                {!insufficientBalance && (
                  <p className="text-green-400 text-sm mt-1">
                    Sau thanh toán: {(balance - totalAmount).toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>

              {insufficientBalance ? (
                <button
                  onClick={() => navigate('/deposit')}
                  className="btn-primary w-full mb-3"
                >
                  Nạp tiền
                </button>
              ) : (
                <button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="btn-primary w-full mb-3"
                >
                  {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              )}

              <button
                onClick={() => navigate('/cart')}
                className="btn-secondary w-full"
              >
                Quay lại giỏ hàng
              </button>

              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">
                  ℹ️ Sau khi thanh toán thành công, thông tin tài khoản sẽ được hiển thị trong chi tiết đơn hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
