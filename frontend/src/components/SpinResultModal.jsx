import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaCoins, FaTicketAlt, FaGamepad } from 'react-icons/fa';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

const SpinResultModal = ({ isOpen, onClose, result }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && result?.type !== 'nothing') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const getIcon = () => {
    switch (result.type) {
      case 'cash':
        return <FaCoins className="text-6xl text-yellow-400" />;
      case 'account':
        return <FaGamepad className="text-6xl text-sky-400" />;
      case 'voucher':
        return <FaTicketAlt className="text-6xl text-orange-400" />;
      default:
        return <FaGift className="text-6xl text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>

          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center"
            >
              {getIcon()}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-orange-400"
            >
              {result.type === 'nothing' ? 'Chúc bạn may mắn lần sau!' : 'Chúc mừng!'}
            </motion.h2>

            {/* Reward label */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <p className="text-lg text-slate-300 mb-2">Bạn đã trúng</p>
              <p className="text-2xl font-bold text-white">{result.label}</p>
              
              {result.type === 'cash' && (
                <p className="text-sm text-slate-400 mt-2">
                  Đã cộng vào số dư của bạn
                </p>
              )}

              {result.type === 'voucher' && result.voucherCode && (
                <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-orange-500/30">
                  <p className="text-xs text-slate-400 mb-1">Mã giảm giá</p>
                  <p className="text-lg font-mono font-bold text-orange-400">{result.voucherCode}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Giảm {result.voucherDiscount}% cho đơn hàng tiếp theo
                  </p>
                </div>
              )}

              {result.type === 'account' && result.account && (
                <div className="mt-4">
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden border-2 border-sky-500">
                    <img 
                      src={result.account.images?.[0]} 
                      alt={result.account.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Đã thêm vào tài khoản đã mua
                  </p>
                </div>
              )}
            </motion.div>

            {/* Remaining spins */}
            {result.remainingSpins !== undefined && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-400"
              >
                Còn lại: <span className="text-white font-semibold">{result.remainingSpins}</span> lượt quay
              </motion.p>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              {result.remainingSpins > 0 ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-sky-500/50"
                  >
                    Quay tiếp
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Về trang chủ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => window.location.href = '/shop'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/50"
                >
                  Mua thêm để nhận lượt quay
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpinResultModal;
