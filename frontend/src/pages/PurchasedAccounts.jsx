import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { usePurchasedAccounts } from '../hooks/useOrders';
import { FiCopy, FiEye, FiEyeOff, FiShoppingBag, FiCalendar, FiTag, FiServer } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PurchasedAccounts = () => {
  const [showPasswords, setShowPasswords] = useState({});

  const { data: accounts, loading: isLoading } = usePurchasedAccounts();

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

  // Group accounts by order
  const groupedAccounts = accounts?.reduce((groups, item) => {
    const orderId = item.orderId;
    if (!groups[orderId]) {
      groups[orderId] = {
        orderNumber: item.orderNumber,
        orderDate: item.orderDate,
        accounts: []
      };
    }
    groups[orderId].accounts.push(item);
    return groups;
  }, {}) || {};

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen pt-20 pb-6">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tài khoản đã mua</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {accounts?.length || 0} tài khoản đã mua
            </p>
          </div>
          <Link 
            to="/profile" 
            className="text-primary hover:text-primary-light"
          >
            ← Quay lại profile
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : !accounts || accounts.length === 0 ? (
          <div className="card text-center py-20">
            <FiShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có tài khoản nào</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn chưa mua tài khoản nào từ shop</p>
            <Link to="/shop" className="btn-primary">
              Mua tài khoản ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAccounts).map(([orderId, group]) => (
              <div key={orderId} className="card">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <FiShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Đơn hàng #{group.orderNumber}
                      </h3>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {format(new Date(group.orderDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Hoàn thành
                  </span>
                </div>

                {/* Accounts in this order */}
                <div className="space-y-4">
                  {group.accounts.map((item) => (
                    <div
                      key={item.account._id}
                      className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Account Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.account.images?.[0] || '/placeholder.jpg'}
                            alt={item.account.title}
                            className="w-full md:w-32 h-32 object-cover rounded-lg"
                          />
                        </div>

                        {/* Account Info */}
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
                                {item.account.title}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {item.account.categoryId?.name && (
                                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                                    {item.account.categoryId.name}
                                  </span>
                                )}
                                {item.account.teamValue && (
                                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs flex items-center">
                                    <FiTag className="w-3 h-3 mr-1" />
                                    Đội hình: {item.account.teamValue}
                                  </span>
                                )}
                                {item.account.bp && (
                                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                                    BP: {item.account.bp}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-primary font-bold text-xl">
                              {item.account.price?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          {/* Credentials */}
                          <div className="bg-slate-50 dark:bg-dark-lighter rounded-lg p-4 space-y-3 border border-slate-200 dark:border-transparent">
                            <p className="text-green-500 dark:text-green-400 font-semibold text-sm flex items-center">
                              <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                              Thông tin tài khoản
                            </p>

                            {/* Username */}
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Tài khoản</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={item.account.username}
                                  readOnly
                                  className="input-field flex-grow text-sm"
                                />
                                <button
                                  onClick={() => copyToClipboard(item.account.username, 'tài khoản')}
                                  className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                                  title="Copy"
                                >
                                  <FiCopy className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>

                            {/* Password */}
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Mật khẩu</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type={showPasswords[item.account._id] ? 'text' : 'password'}
                                  value={item.account.password}
                                  readOnly
                                  className="input-field flex-grow text-sm"
                                />
                                <button
                                  onClick={() => togglePasswordVisibility(item.account._id)}
                                  className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                  title={showPasswords[item.account._id] ? 'Ẩn' : 'Hiện'}
                                >
                                  {showPasswords[item.account._id] ? (
                                    <FiEyeOff className="w-4 h-4 text-slate-700 dark:text-white" />
                                  ) : (
                                    <FiEye className="w-4 h-4 text-slate-700 dark:text-white" />
                                  )}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(item.account.password, 'mật khẩu')}
                                  className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                                  title="Copy"
                                >
                                  <FiCopy className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>

                            {/* Additional Info */}
                            {item.account.additionalInfo && (
                              <div>
                                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Thông tin thêm</label>
                                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">
                                  {item.account.additionalInfo}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedAccounts;
