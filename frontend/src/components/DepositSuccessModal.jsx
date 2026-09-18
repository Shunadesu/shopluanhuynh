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
  const [confettiActive, setConfettiActive] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Kích hoạt confetti khi modal mở
  useEffect(() => {
    if (isOpen) {
      setConfettiActive(true);
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 5000);
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
      {/* Confetti Effect */}
      {confettiActive && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          recycle={false}
          gravity={0.3}
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 60 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          {/* Animated Check Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-5 shadow-xl shadow-green-500/40"
          >
            <FiCheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-2xl font-black text-slate-900 dark:text-white mb-1"
          >
            🎉 Nạp tiền thành công!
          </motion.h2>

          {/* Method subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="text-sm text-slate-500 dark:text-slate-400 mb-5"
          >
            Đã nạp qua {methodText}
          </motion.p>

          {/* Amount Display */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl p-5 mb-5 border border-cyan-200 dark:border-cyan-700"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Số dư đã được cộng</p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              +{amount.toLocaleString('vi-VN')}đ
            </p>
            
            {/* New Balance Display */}
            {newBalance !== undefined && (
              <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Số dư hiện tại</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {newBalance.toLocaleString('vi-VN')}đ
                </p>
              </div>
            )}
          </motion.div>

          {/* Bonus Hint */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6"
          >
            <FiZap className="w-4 h-4 text-amber-500" />
            <span>Có thể nhận thêm lượt quay vòng may mắn!</span>
            <FiGift className="w-4 h-4 text-pink-500" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={handleGoHome}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <FiHome className="w-4 h-4" />
              Về trang chủ
            </button>
            <button
              onClick={handleGoShop}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
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
