import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FiUser, FiMail, FiPhone, FiDollarSign, FiShoppingBag, FiCreditCard } from 'react-icons/fi';

const Profile = () => {
  // Fetch user info
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-white mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 bg-primary/20 text-primary rounded-lg"
                >
                  <FiUser />
                  <span>Thông tin tài khoản</span>
                </Link>
                <Link
                  to="/profile/orders"
                  className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiShoppingBag />
                  <span>Đơn hàng</span>
                </Link>
                <Link
                  to="/profile/deposits"
                  className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiCreditCard />
                  <span>Lịch sử nạp tiền</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {/* Balance Card */}
            <div className="card mb-6 bg-gradient-to-br from-primary-dark to-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Số dư tài khoản</p>
                  <p className="text-3xl font-bold text-white">
                    {user?.balance?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <FiDollarSign className="w-16 h-16 text-white/30" />
              </div>
              <Link to="/deposit" className="btn-secondary mt-4 bg-white text-primary hover:bg-slate-100">
                Nạp tiền
              </Link>
            </div>

            {/* Info Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Thông tin cá nhân</h2>

              <div className="space-y-2">
                <div className="flex items-start space-x-2 pb-2 border-b border-slate-700">
                  <FiUser className="w-5 h-5 text-slate-400 mt-1" />
                  <div className="flex-grow">
                    <p className="text-slate-400 text-sm mb-1">Họ tên</p>
                    <p className="text-white font-semibold">{user?.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pb-2 border-b border-slate-700">
                  <FiMail className="w-5 h-5 text-slate-400 mt-1" />
                  <div className="flex-grow">
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pb-2 border-b border-slate-700">
                  <FiPhone className="w-5 h-5 text-slate-400 mt-1" />
                  <div className="flex-grow">
                    <p className="text-slate-400 text-sm mb-1">Số điện thoại</p>
                    <p className="text-white font-semibold">{user?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pb-2 border-b border-slate-700">
                  <FiShoppingBag className="w-5 h-5 text-slate-400 mt-1" />
                  <div className="flex-grow">
                    <p className="text-slate-400 text-sm mb-1">Tổng đơn hàng</p>
                    <p className="text-white font-semibold">{user?.purchaseHistory?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center mt-1">
                    <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-slate-400 text-sm mb-1">Trạng thái</p>
                    <p className={`font-semibold ${user?.isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                      {user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link to="/shop" className="card hover:scale-105 transition-transform text-center">
                <FiShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-white font-semibold">Mua tài khoản</p>
              </Link>
              <Link to="/profile/orders" className="card hover:scale-105 transition-transform text-center">
                <FiCreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-white font-semibold">Đơn hàng</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
