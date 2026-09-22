import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { FiCheckCircle, FiZap, FiGift, FiHome, FiShoppingBag } from 'react-icons/fi';

/**
 * Modal celebration cho nạp tiền thành công với hiệu ứng pháo hoa
 * @param {boolean} isOpen - Hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {number} amount - Số tiền đã nạp
 * @param {string} method - Phương thức nạp: 'bank' hoặc 'card'
 * @param {number} newBalance - Số dư mới (optional)
 */
const DepositSuccessModal = ({ isOpen, onClose, amount = 0, method = 'bank', newBalance }) => {
  console.log('🔍 [DepositSuccessModal] Render:', { isOpen, amount, method, newBalance });
  
  const [confettiActive, setConfettiActive] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Kích hoạt confetti khi modal mở - kéo dài 10 giây
  useEffect(() => {
    console.log('🎊 [DepositSuccessModal] useEffect triggered, isOpen:', isOpen);
    if (isOpen) {
      setConfettiActive(true);
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setConfettiActive(false);
    }
  }, [isOpen]);

  // Theo dõi resize window cho confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Xử lý navigation
  const handleGoHome = () => {
    onClose();
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleGoShop = () => {
    onClose();
    setTimeout(() => {
      window.location.href = '/shop';
    }, 100);
  };

  if (!isOpen) return null;

  const methodText = method === 'bank' ? 'chuyển khoản ngân hàng' : 'thẻ cào điện thoại';

  return (
    <>
      {/* Confetti Effect - kéo dài 10 giây, recycle để pháo hoa liên tục */}
      {confettiActive && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={250}
          recycle={true}
          gravity={0.18}
          initialVelocityY={12}
          colors={['#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ffffff', '#fbbf24']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}

      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: 40 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-200/70 dark:ring-slate-700 max-w-sm w-full p-6 text-center overflow-hidden">
          {/* Subtle decorative gradient blob */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-300/20 to-cyan-400/20 blur-2xl" />

          {/* Animated Check Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.08 }}
            className="relative w-16 h-16 mx-auto mb-4"
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/30">
              <FiCheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-slate-900 dark:text-white mb-1"
          >
            🎉 Nạp tiền thành công!
          </motion.h2>

          {/* Method subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="text-xs text-slate-500 dark:text-slate-400 mb-4"
          >
            Đã nạp qua {methodText}
          </motion.p>

          {/* Amount Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-4 mb-4 border border-cyan-200/60 dark:border-cyan-700/60"
          >
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-0.5">Số dư đã được cộng</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              +{amount.toLocaleString('vi-VN')}đ
            </p>

            {/* New Balance Display */}
            {newBalance !== undefined && (
              <div className="mt-2.5 pt-2.5 border-t border-cyan-200/60 dark:border-cyan-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Số dư hiện tại</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {newBalance.toLocaleString('vi-VN')}đ
                </p>
              </div>
            )}
          </motion.div>

          {/* Bonus Hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5"
          >
            <FiZap className="w-3.5 h-3.5 text-amber-500" />
            <span>Có thể nhận thêm lượt quay vòng may mắn!</span>
            <FiGift className="w-3.5 h-3.5 text-pink-500" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <button
              onClick={handleGoHome}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-sm shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FiHome className="w-4 h-4" />
              Về trang chủ
            </button>
            <button
              onClick={handleGoShop}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FiShoppingBag className="w-4 h-4" />
              Tiếp tục mua sắm
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default DepositSuccessModal;
