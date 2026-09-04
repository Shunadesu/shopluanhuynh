import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi';

const Orders = () => {
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    }
  });

  if (isLoading) return <Loading />;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm">
            <FiCheckCircle />
            <span>Hoàn thành</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm">
            <FiClock />
            <span>Đang xử lý</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Đơn hàng của tôi</h1>
          <Link to="/profile" className="text-primary hover:text-primary-light">
            ← Quay lại
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="card text-center py-20">
            <FiPackage className="w-20 h-20 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6">Bạn chưa có đơn hàng nào</p>
            <Link to="/shop" className="btn-primary inline-block">
              Mua ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/profile/orders/${order._id}`}
                className="card hover:border-primary transition-colors block"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-white font-semibold">#{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm mb-1">Tổng tiền</p>
                    <p className="text-primary font-bold text-xl">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 text-sm mb-2">
                    {order.items.length} sản phẩm
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      item.accountId && (
                        <div key={idx} className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded">
                          <img
                            src={item.accountId.images?.[0] || '/placeholder.jpg'}
                            alt={item.accountId.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-slate-300 text-sm line-clamp-1">
                            {item.accountId.title}
                          </span>
                        </div>
                      )
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center px-3 py-2 text-slate-400 text-sm">
                        +{order.items.length - 3} khác
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-primary hover:text-primary-light">
                    Xem chi tiết →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
