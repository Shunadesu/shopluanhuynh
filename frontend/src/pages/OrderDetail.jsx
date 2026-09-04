import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FiCheckCircle, FiClock, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [showPasswords, setShowPasswords] = useState({});

  // Fetch order detail
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    }
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  const togglePasswordVisibility = (accountId) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  if (isLoading) return <Loading />;

  if (!order) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container-custom">
          <p className="text-slate-400">Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full">
            <FiCheckCircle />
            <span>Hoàn thành</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full">
            <FiClock />
            <span>Đang xử lý</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-500/20 text-red-500 px-4 py-2 rounded-full">
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
          <h1 className="text-3xl font-bold text-white">Chi tiết đơn hàng</h1>
          <Link to="/profile/orders" className="text-primary hover:text-primary-light">
            ← Quay lại
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-2">
            {/* Status Card */}
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">#{order.orderNumber}</h2>
                  <p className="text-slate-400">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-4">Sản phẩm đã mua</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  item.accountId && (
                    <div key={idx} className="pb-6 border-b border-slate-700 last:border-0 last:pb-0">
                      <div className="flex gap-2 mb-2">
                        <img
                          src={item.accountId.images?.[0] || '/placeholder.jpg'}
                          alt={item.accountId.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-grow">
                          <h4 className="text-white font-semibold mb-2">
                            {item.accountId.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.accountId.rank && (
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                                {item.accountId.rank}
                              </span>
                            )}
                            {item.accountId.server && (
                              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                {item.accountId.server}
                              </span>
                            )}
                          </div>
                          <p className="text-primary font-bold">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {/* Account Credentials */}
                      {order.status === 'completed' && item.accountId.username && (
                        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                          <p className="text-green-400 font-semibold mb-3">
                            ✓ Thông tin tài khoản
                          </p>
                          
                          {/* Username */}
                          <div>
                            <label className="block text-slate-400 text-sm mb-2">Tài khoản</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={item.accountId.username}
                                readOnly
                                className="input-field flex-grow"
                              />
                              <button
                                onClick={() => copyToClipboard(item.accountId.username, 'tài khoản')}
                                className="p-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                                title="Copy"
                              >
                                <FiCopy className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div>
                            <label className="block text-slate-400 text-sm mb-2">Mật khẩu</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type={showPasswords[item.accountId._id] ? 'text' : 'password'}
                                value={item.accountId.password}
                                readOnly
                                className="input-field flex-grow"
                              />
                              <button
                                onClick={() => togglePasswordVisibility(item.accountId._id)}
                                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                title={showPasswords[item.accountId._id] ? 'Ẩn' : 'Hiện'}
                              >
                                {showPasswords[item.accountId._id] ? (
                                  <FiEyeOff className="w-5 h-5 text-white" />
                                ) : (
                                  <FiEye className="w-5 h-5 text-white" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.accountId.password, 'mật khẩu')}
                                className="p-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                                title="Copy"
                              >
                                <FiCopy className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {item.accountId.additionalInfo && (
                            <div>
                              <label className="block text-slate-400 text-sm mb-2">Thông tin thêm</label>
                              <p className="text-slate-300 text-sm whitespace-pre-line">
                                {item.accountId.additionalInfo}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Tóm tắt đơn hàng</h3>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-slate-400">
                  <span>Số lượng:</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phương thức:</span>
                  <span>Số dư TK</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-xl">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {order.status === 'completed' && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <p className="text-green-400 text-sm">
                    ✓ Đơn hàng đã hoàn thành. Thông tin tài khoản đã hiển thị bên trái.
                  </p>
                </div>
              )}

              {order.status === 'pending' && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⏳ Đơn hàng đang được xử lý...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
