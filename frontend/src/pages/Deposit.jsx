import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useDepositStore } from '../store/data/depositStore';
import { useBankAccounts, useUserProfile } from '../hooks';
import api from '../utils/api';
import { DepositSkeleton } from '../components/SkeletonLoader';
import { FiDollarSign, FiCopy, FiCheck, FiCreditCard, FiPhone } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Preset amounts for deposit
const PRESET_AMOUNTS = [
  { value: 10000, label: '10K' },
  { value: 20000, label: '20K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 200000, label: '200K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M' },
  { value: 2000000, label: '2M' },
  { value: 5000000, label: '5M' },
];

// Amount Chip Component
const AmountChip = ({ amount, label, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all overflow-hidden ${
      isSelected
        ? 'bg-primary text-white shadow-lg shadow-primary/30'
        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    {isSelected && (
      <motion.div
        layoutId="amountChip"
        className="absolute inset-0 bg-primary"
        initial={false}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    )}
    <span className={`relative z-10 ${isSelected ? 'text-white' : ''}`}>
      {label}
    </span>
  </motion.button>
);

const Deposit = ({ onOpenAuth }) => {
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch bank accounts
  const { data: bankAccounts, loading: banksLoading } = useBankAccounts();

  // Fetch user info - only when authenticated
  const { data: user, loading: userLoading } = useUserProfile({ enabled: isAuthenticated });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }));
      toast.error('Vui lòng đăng nhập để nạp tiền');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!amount || numericAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    if (!selectedBank) {
      toast.error('Vui lòng chọn ngân hàng');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/deposits/request', {
        amount: numericAmount,
        bankAccountId: selectedBank._id,
        transferNote: `${user?.username} ${amount}`,
      });
      toast.success('Yêu cầu nạp tiền đã được gửi!');
      useDepositStore.getState().addMyRequest(res.data);
      setAmount('');
      setSelectedBank(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  // Show loading skeleton
  if (banksLoading) return <DepositSkeleton />;

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Nạp tiền</h1>
          <Link 
            to="/profile/deposits" 
            className="text-primary hover:text-primary-light transition-colors font-medium"
          >
            Lịch sử nạp tiền →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Balance */}
            <div className="card bg-gradient-to-br from-primary-dark to-primary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="w-5 h-5 text-white/80" />
                    <p className="text-white/80 text-sm font-medium">Số dư hiện tại</p>
                  </div>
                  {isAuthenticated && !userLoading ? (
                    <p className="text-4xl font-bold text-white">
                      {user?.balance !== undefined 
                        ? `${user.balance.toLocaleString('vi-VN')}đ`
                        : '---'
                      }
                    </p>
                  ) : (
                    <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse" />
                  )}
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <FiDollarSign className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </div>

            {/* Login Prompt - Show when not authenticated */}
            {!isAuthenticated && (
              <div className="card bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCreditCard className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">Vui lòng đăng nhập để nạp tiền</p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }))}
                    className="btn-primary"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            )}

            {/* Amount Input */}
            {isAuthenticated && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiPhone className="w-5 h-5 text-primary" />
                  Số tiền muốn nạp
                </h2>
                
                {/* Custom Amount Input */}
                <div className="relative mb-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleCustomAmount}
                    className="w-full h-16 px-4 pr-12 text-2xl font-bold text-center bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary focus:ring-0 transition-colors"
                    placeholder="Nhập số tiền..."
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">đ</span>
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">
                    Chọn nhanh số tiền
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <AmountChip
                        key={preset.value}
                        amount={preset.value}
                        label={preset.label}
                        isSelected={amount === preset.value.toString()}
                        onClick={() => handleAmountSelect(preset.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Amount Info */}
                <AnimatePresence>
                  {amount && parseFloat(amount) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 rounded-lg text-center ${
                        parseFloat(amount) >= 10000
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                      }`}
                    >
                      {parseFloat(amount) >= 10000 ? (
                        <span className="text-sm font-medium">
                          ✓ Số tiền hợp lệ (tối thiểu 10,000đ)
                        </span>
                      ) : (
                        <span className="text-sm font-medium">
                          Số tiền tối thiểu là 10,000đ
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bank Selection */}
            {isAuthenticated && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-primary" />
                  Chọn tài khoản ngân hàng
                </h2>
                
                {!bankAccounts || bankAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCreditCard className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Hiện chưa có tài khoản ngân hàng nào</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Vui lòng thử lại sau</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {bankAccounts.map((bank) => (
                      <motion.div
                        key={bank._id}
                        onClick={() => setSelectedBank(bank)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedBank?._id === bank._id
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {bank.qrCodeImage && (
                            <div className="relative shrink-0">
                              <img
                                src={bank.qrCodeImage}
                                alt={bank.bankName}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              {selectedBank?._id === bank._id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <FiCheck className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">{bank.bankName}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                              <span className="text-slate-400">STK:</span> {bank.accountNumber}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                              <span className="text-slate-400">Tên:</span> {bank.accountName}
                            </p>
                            {bank.identifier && (
                              <p className="text-primary text-xs mt-1">
                                <span className="text-slate-400">ID:</span> {bank.identifier}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FiPhone className="w-5 h-5 text-primary" />
                Hướng dẫn nạp tiền
              </h3>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCreditCard className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Vui lòng đăng nhập để nạp tiền</p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthDrawer', { detail: { view: 'login' } }))}
                    className="btn-primary w-full"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : selectedBank && amount && parseFloat(amount) >= 10000 ? (
                <div className="space-y-4">
                  {/* Transfer Amount */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Số tiền chuyển</p>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-2xl">
                        {parseFloat(amount).toLocaleString('vi-VN')}đ
                      </p>
                      <button
                        onClick={() => copyToClipboard(amount, 'số tiền')}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Copy số tiền"
                      >
                        <FiCopy className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Transfer Content */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Nội dung chuyển khoản</p>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 dark:text-white font-medium text-sm break-all">
                        {user?.username} {amount}
                      </p>
                      <button
                        onClick={() => copyToClipboard(`${user?.username} ${amount}`, 'nội dung')}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0 ml-2"
                        title="Copy nội dung"
                      >
                        <FiCopy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Thông tin tài khoản</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{selectedBank.bankName}</span>
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      STK: <span className="font-mono">{selectedBank.accountNumber}</span>
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Tên: {selectedBank.accountName}
                    </p>
                  </div>

                  {/* QR Code */}
                  {selectedBank.qrCodeImage && (
                    <div className="text-center bg-white dark:bg-slate-800 rounded-xl p-4">
                      <img
                        src={selectedBank.qrCodeImage}
                        alt="QR Code"
                        className="w-40 h-40 mx-auto rounded-lg"
                      />
                      <p className="text-xs text-slate-400 mt-2">Quét mã QR để chuyển tiền</p>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-base font-semibold"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      '✓ Xác nhận đã chuyển khoản'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <p>Chọn hoặc nhập số tiền muốn nạp (tối thiểu 10,000đ)</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <p>Chọn tài khoản ngân hàng để nạp</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <p>Quét mã QR hoặc chuyển khoản thủ công</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <p>Nhập đúng <strong className="text-primary">nội dung chuyển khoản</strong></p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
                      <p>Nhấn "Xác nhận đã chuyển khoản"</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">6</span>
                      <p>Chờ admin duyệt (thường trong vài phút)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  ⚠️ Lưu ý quan trọng
                </p>
                <ul className="text-yellow-600 dark:text-yellow-400 text-xs mt-2 space-y-1">
                  <li>• Chuyển đúng số tiền và nội dung</li>
                  <li>• Không làm tròn số tiền</li>
                  <li>• Kiểm tra kỹ trước khi xác nhận</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
