import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useDepositStore } from '../store/data/depositStore';
import {
  FiCopy,
  FiCheck,
  FiCreditCard,
  FiPhone,
  FiArrowLeft,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';

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

const AmountChip = ({ amount, label, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    type="button"
    className={`relative px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all overflow-hidden ${
      isSelected
        ? 'bg-primary text-white shadow-lg shadow-primary/30'
        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    {isSelected && (
      <motion.div
        layoutId="depositAmountChip"
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

const DepositPanel = ({ user }) => {
  const { user: authUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState('input'); // 'input' | 'show-info'
  const [bankInfo, setBankInfo] = useState(null);
  const [depositInfo, setDepositInfo] = useState(null);

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
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success(`Đã copy ${label}`);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const numericAmount = parseFloat(amount);
    if (!amount || numericAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/deposits/random-request', { amount: numericAmount });
      setBankInfo(res.data.bank);
      setDepositInfo(res.data.deposit);
      setPhase('show-info');
      // Cập nhật lịch sử nạp của user (request mới đã được tạo pending)
      try {
        await useDepositStore.getState().fetchMyRequests(true);
      } catch {}
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    toast.success(
      `Đã ghi nhận yêu cầu nạp ${parseFloat(amount).toLocaleString('vi-VN')}đ. Vui lòng chờ admin duyệt.`
    );
    handleReset();
  };

  const handleReset = () => {
    setAmount('');
    setBankInfo(null);
    setDepositInfo(null);
    setPhase('input');
  };

  const numericAmount = parseFloat(amount) || 0;
  const currentUsername = authUser?.username || user?.username || '';
  const transferContent = `${currentUsername} ${amount}`;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <FiCreditCard className="w-6 h-6 text-primary" />
              Nạp số dư bằng ngân hàng
            </h1>
            
          </div>
          {phase === 'show-info' && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
            >
              <FiArrowLeft className="w-4 h-4" /> Nhập lại
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Cột trái - Form */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {phase === 'input' ? (
              <motion.form
                key="input"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="card p-5 sm:p-6 space-y-5"
              >
                {/* Số tiền input */}
                <div>
                  <div className='flex items-center justify-between '>
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2 block">
                    Số tiền cần nạp
                  </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Tối thiểu 10,000đ
                  </p>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={handleCustomAmount}
                      className="w-full h-14 px-4 pr-12 text-xl font-bold text-center bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary focus:ring-0 transition-colors"
                      placeholder="Nhập số tiền..."
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      đ
                    </span>
                  </div>
                  
                </div>

                {/* Hướng dẫn nạp */}
                <div className="recharge-guide">
                  <p className="guide-title">Làm thế nào để nạp số dư vào tài khoản</p>
                  <p className="guide-steps">
                    <span>1. Nhập số tiền cần nạp</span>
                    <span>2. Chọn nạp tiền và quét mã QR thanh toán (tiền sẽ vào tài khoản trong tối đa 5 phút)</span>
                  </p>
                  <p className="guide-note">
                    <strong>Lưu ý:</strong> Hệ thống nạp tiền tự động theo nội dung chuyển khoản nên khách hàng vui lòng chuyển đúng số tiền đã nhập và đúng nội dung chuyển khoản.
                  </p>
                </div>

                {/* Preset chips */}
                <div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                    Hoặc chọn nhanh
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !amount || numericAmount < 10000}
                  className="btn-primary w-full py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Đang tạo yêu cầu...
                    </span>
                  ) : (
                    'Nạp tiền'
                  )}
                </button>

                
              </motion.form>
            ) : (
              <motion.div
                key="show-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="card p-5 sm:p-6 space-y-4"
              >
                {/* Số tiền + ID yêu cầu */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
                        Số tiền cần chuyển
                      </p>
                      <p className="text-primary font-black text-3xl">
                        {numericAmount.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(numericAmount, 'số tiền')}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Copy số tiền"
                    >
                      <FiCopy className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                  {depositInfo?._id && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Mã yêu cầu: <span className="font-mono">{depositInfo._id.slice(-8).toUpperCase()}</span>
                    </p>
                  )}
                </div>

                {/* Nội dung CK */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
                    Nội dung chuyển khoản (bắt buộc)
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-slate-900 dark:text-white font-bold text-base break-all">
                      {transferContent}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'nội dung')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                      title="Copy nội dung"
                    >
                      <FiCopy className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Bank info */}
                {bankInfo && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                      Thông tin tài khoản nhận
                    </p>
                    <InfoRow label="Ngân hàng" value={bankInfo.bankName} copyable onCopy={() => copyToClipboard(bankInfo.bankName, 'tên ngân hàng')} />
                    <InfoRow
                      label="Số tài khoản"
                      value={bankInfo.accountNumber}
                      mono
                      copyable
                      onCopy={() => copyToClipboard(bankInfo.accountNumber, 'số tài khoản')}
                    />
                    <InfoRow
                      label="Chủ tài khoản"
                      value={bankInfo.accountName}
                      copyable
                      onCopy={() => copyToClipboard(bankInfo.accountName, 'tên chủ tài khoản')}
                    />
                    {bankInfo.identifier && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                        Mã định danh: <span className="font-mono text-primary">{bankInfo.identifier}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <FiAlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      <p className="font-semibold">Lưu ý quan trọng</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>Chuyển đúng số tiền và nội dung</li>
                        <li>Không làm tròn số tiền</li>
                        <li>Admin sẽ tự check ngân hàng và duyệt thủ công</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirm */}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="btn-primary w-full py-3 text-base font-bold flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-5 h-5" /> Đã chuyển xong - Tạo yêu cầu
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cột phải - Hướng dẫn hoặc QR */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {phase === 'show-info' && bankInfo && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="card p-5 sm:p-6 text-center lg:sticky lg:top-20"
              >
                <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-3">
                  Quét mã QR để chuyển khoản
                </p>
                {bankInfo.qrCodeImage ? (
                  <div className="bg-white dark:bg-white p-3 rounded-xl border-2 border-primary/20 inline-block">
                    <img
                      src={bankInfo.qrCodeImage}
                      alt={`QR ${bankInfo.bankName}`}
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <FiCreditCard className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  Mở app ngân hàng → Quét QR → Xác nhận
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-left space-y-1.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ngân hàng</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{bankInfo.bankName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Số tài khoản</p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {bankInfo.accountNumber}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Chủ tài khoản</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{bankInfo.accountName}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono, copyable, onCopy }) => {
  const isMono = Boolean(mono);
  const canCopy = Boolean(copyable);
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
        <p
          className={`${
            isMono ? 'font-mono' : ''
          } text-slate-900 dark:text-white font-semibold text-sm truncate`}
        >
          {value}
        </p>
      </div>
      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
          title={`Copy ${label}`}
        >
          <FiCopy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default DepositPanel;
