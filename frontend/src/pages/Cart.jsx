import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';
import Loading from '../components/Loading';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

const Cart = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cartData, loading: isLoading, items, remove } = useCart();

  const handleRemove = async (accountId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await remove(accountId);
        toast.success('Đã xóa khỏi giỏ hàng');
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Vui lòng đăng nhập');
          onOpenAuth?.('login');
        } else {
          toast.error(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
        }
      }
    }
  };

  if (isLoading) return <Loading />;
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 pb-6">
        <SEOHead
          title="Giỏ Hàng Trống"
          description="Giỏ hàng của bạn đang trống. Hãy chọn tài khoản game yêu thích để thêm vào giỏ hàng."
          type="website"
        />
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Giỏ hàng</h1>
          <div className="card text-center py-20">
            <FiShoppingBag className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
            <Link to="/shop" className="btn-primary inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-6">
      <SEOHead
        title={`Giỏ Hàng (${items.length} sản phẩm)`}
        description={`Bạn có ${items.length} tài khoản game trong giỏ hàng. Tiếp tục mua sắm hoặc tiến hành thanh toán.`}
        type="website"
      />
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Giỏ hàng ({items.length})</h1>

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
                      <h3 className="text-slate-900 dark:text-white font-semibold mb-2 hover:text-primary line-clamp-2">
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
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                          {item.server}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-slate-500 dark:text-slate-500 text-sm line-through">
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
                        disabled={false}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-lg transition-colors"
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Tổng đơn hàng</h2>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Số lượng sản phẩm:</span>
                  <span>{items.length}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-slate-900 dark:text-white font-bold text-xl">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenAuth?.('login');
                    return;
                  }
                  navigate('/checkout');
                }}
                className="btn-primary w-full"
              >
                Thanh toán
              </button>

              <Link to="/shop" className="btn-secondary w-full mt-3">
                Tiếp tục mua sắm
              </Link>

              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
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
