import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useDepositStore } from '../store/data/depositStore';
import { useUserProfile } from '../hooks/useUserProfile';
import {
  FiCopy,
  FiCreditCard,
  FiArrowLeft,
  FiAlertTriangle,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
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

// Thời gian user có thể chuyển khoản trước khi yêu cầu hết hạn
const DEPOSIT_TTL_MS = 5 * 60 * 1000; // 5 phút
const POLL_INTERVAL_MS = 10 * 1000; // 10 giây

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
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { refresh: refreshProfile } = useUserProfile({ enabled: false });
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState('input'); // 'input' | 'show-info' | 'success'
  const [bankInfo, setBankInfo] = useState(null);
  const [depositInfo, setDepositInfo] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [autoRedirectIn, setAutoRedirectIn] = useState(3);
  const tickRef = useRef(null);
  const pollRef = useRef(null);

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
      setNow(Date.now());
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

  const handleReset = () => {
    setAmount('');
    setBankInfo(null);
    setDepositInfo(null);
    setPhase('input');
    setNow(Date.now());
    setAutoRedirectIn(3);
  };

  // === Countdown 5 phút — hết giờ thì redirect về home ===
  // Đồng thời polling im lặng để catch khi admin duyệt → chuyển sang success
  useEffect(() => {
    if (phase !== 'show-info' || !depositInfo?._id || !depositInfo?.createdAt) return;

    // Tick mỗi giây để render countdown
    tickRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Poll im lặng mỗi 10s — KHÔNG hiện trạng thái pending cho user,
    // chỉ lắng nghe admin duyệt để chuyển sang màn success.
    const pollOnce = async () => {
      if (document.hidden) return;
      try {
        const updated = await useDepositStore.getState().checkOneRequest(depositInfo._id);
        if (updated?.status === 'approved') {
          try { await refreshProfile(); } catch {}
          setPhase('success');
          setNow(Date.now());
        } else if (updated?.status === 'rejected') {
          // Không hiện "bị từ chối" — đã hết giờ thì về home, còn nếu admin từ chối
          // giữa lúc countdown thì vẫn redirect về home để giữ UX tự động.
          setDepositInfo((prev) => ({ ...prev, ...updated }));
          navigate('/');
        }
      } catch {
        // im lặng
      }
    };

    pollRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      tickRef.current = null;
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, depositInfo?._id]);

  // === Hết giờ -> redirect về home ===
  useEffect(() => {
    if (phase !== 'show-info' || !depositInfo?.createdAt) return;
    const expiresAt = new Date(depositInfo.createdAt).getTime() + DEPOSIT_TTL_MS;
    const delay = expiresAt - Date.now();
    if (delay <= 0) return; // đã hết giờ rồi
    const t = setTimeout(() => navigate('/'), delay);
    return () => clearTimeout(t);
  }, [phase, depositInfo?.createdAt]);

  // === Auto redirect 3s sau khi success ===
  useEffect(() => {
    if (phase !== 'success') return;
    setAutoRedirectIn(3);
    const t = setInterval(() => {
      setAutoRedirectIn((v) => {
        if (v <= 1) {
          clearInterval(t);
          navigate('/');
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, navigate]);

  const numericAmount = parseFloat(amount) || 0;
  const currentUsername = authUser?.username || user?.username || '';
  const transferContent = `${currentUsername} ${amount}`;

  // Tính thời gian còn lại (ms) khi show-info
  let remainingMs = 0;
  if (phase === 'show-info' && depositInfo?.createdAt) {
    const expiresAt = new Date(depositInfo.createdAt).getTime() + DEPOSIT_TTL_MS;
    remainingMs = Math.max(0, expiresAt - now);
  }
  const remainingSec = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const isExpiringSoon = phase === 'show-info' && remainingMs > 0 && remainingMs <= 60_000;
  const isExpired = phase === 'show-info' && remainingMs === 0;

  // Countdown chỉ dừng tick khi hết giờ; polling vẫn chạy để admin vẫn có thể duyệt
  useEffect(() => {
    if (phase === 'show-info' && remainingMs === 0 && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [phase, remainingMs]);

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
          {phase !== 'input' && (
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
                className="card p-2 space-y-5"
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
                  <div className="grid grid-cols-3 gap-2">
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
                className="card p-2 sm:p-6 space-y-4"
              >
                {/* Số tiền + ID yêu cầu */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
                        Số tiền cần chuyển
                      </p>
                      <p className="text-primary font-black text-2xl">
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mã yêu cầu: <span className="font-mono">{depositInfo._id.slice(-8).toUpperCase()}</span>
                    </p>
                  )}
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

                    <InfoRow
                      label="Nội dung chuyển khoản"
                      value={transferContent}
                      copyable
                      onCopy={() => copyToClipboard(transferContent, 'nội dung chuyển khoản')}
                    />
                    
                    
                   
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
                      </ul>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cột phải - Hướng dẫn hoặc QR / Success / Expired / Rejected */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {phase === 'show-info' && bankInfo && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="card p-2 text-center lg:sticky lg:top-20"
              >
                <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-3">
                  Quét mã QR để chuyển khoản
                </p>
                {bankInfo.qrCodeImage ? (
                  <div className="bg-white dark:bg-white p-3 rounded-xl border-2 border-primary/20 inline-block">
                    <img
                      src={bankInfo.qrCodeImage}
                      alt={`QR ${bankInfo.bankName}`}
                      className="w-56 h-56 sm:w-64 sm:h-64 mx-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <FiCreditCard className="w-12 h-12 text-slate-400" />
                  </div>
                )}

                {/* Countdown 5 phút */}
                <div
                  className={`mt-4 rounded-xl border p-3 flex items-center justify-center gap-2 ${
                    isExpired
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      : isExpiringSoon
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <FiClock
                    className={`w-4 h-4 shrink-0 ${
                      isExpired
                        ? 'text-slate-500 dark:text-slate-400'
                        : isExpiringSoon
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                  <div className="text-left">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {isExpired ? 'Đã hết thời gian — về trang chủ' : 'Thời gian chuyển khoản còn lại'}
                    </p>
                    <p
                      className={`font-mono font-black text-lg leading-tight ${
                        isExpired
                          ? 'text-slate-500 dark:text-slate-400'
                          : isExpiringSoon
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {mm}:{ss}
                    </p>
                  </div>
                </div>

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

            {phase === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="card p-2 text-center lg:sticky lg:top-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
                >
                  <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </motion.div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Nạp tiền thành công
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  Số dư của bạn đã được cộng{' '}
                  <span className="font-bold text-primary">
                    +{numericAmount.toLocaleString('vi-VN')}đ
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Tự động về trang chủ sau {autoRedirectIn}s
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-primary w-full py-2.5 text-sm font-bold"
                >
                  Về trang chủ ngay
                </button>
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
