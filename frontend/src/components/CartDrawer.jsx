import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import { FiTrash2, FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = ({ isOpen, onClose, onOpenAuth }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCartCount } = useCartStore();

  // Fetch cart
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/orders/cart');
      return res.data;
    },
    enabled: isOpen,
    onSuccess: (data) => {
      setCartCount(data?.items?.length || 0);
    },
    onError: (error) => {
      // 401 means user not logged in and no guest cart - that's ok
      if (error.response?.status !== 401) {
        console.error('Failed to fetch cart:', error);
      }
      setCartCount(0);
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (accountId) => {
      const res = await api.delete(`/orders/cart/${accountId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Đã xóa khỏi giỏ hàng');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập');
        onOpenAuth?.('login');
      } else {
        toast.error(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
      }
    }
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleRemove = (accountId) => {
    removeFromCartMutation.mutate(accountId);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: { 
      x: '100%',
      opacity: 0
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300
      }
    },
    exit: { 
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: { 
      opacity: 0,
      x: -50,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  if (!isOpen) return null;

  const items = cartData?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[40vw] bg-dark-light border-l border-slate-700 shadow-2xl flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="sticky top-0 bg-dark-light border-b border-slate-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5" />
                Giỏ hàng ({items.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto">
              {items.length === 0 ? (
                /* Empty Cart */
                <motion.div 
                  className="flex flex-col items-center justify-center h-full p-6 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <FiShoppingBag className="w-20 h-20 text-slate-600 mb-4" />
                  </motion.div>
                  <p className="text-slate-400 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="btn-primary"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </motion.div>
              ) : (
                /* Cart Items */
                <motion.div 
                  className="p-4 space-y-4"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={item._id} 
                        className="bg-dark rounded-lg p-4"
                        variants={itemVariants}
                        layout
                        exit="exit"
                      >
                        <div className="flex gap-4">
                          {/* Image */}
                          <Link
                            to={`/account/${item._id}`}
                            onClick={onClose}
                            className="flex-shrink-0"
                          >
                            <motion.img
                              src={item.images?.[0] || '/placeholder.jpg'}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex-grow min-w-0">
                            <Link
                              to={`/account/${item._id}`}
                              onClick={onClose}
                              className="block"
                            >
                              <h3 className="text-white font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                            </Link>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.rank && (
                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">
                                  {item.rank}
                                </span>
                              )}
                              {item.server && (
                                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">
                                  {item.server}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <motion.p 
                                className="text-primary font-bold"
                                key={item.price}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                {item.price.toLocaleString('vi-VN')}đ
                              </motion.p>

                              {/* Remove Button */}
                              <motion.button
                                onClick={() => handleRemove(item._id)}
                                disabled={removeFromCartMutation.isPending}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Xóa"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer - Summary & Actions */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div 
                  className="border-t border-slate-700 p-4 space-y-4"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                >
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Số lượng sản phẩm:</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <motion.span 
                        className="text-primary"
                        key={totalAmount}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {totalAmount.toLocaleString('vi-VN')}đ
                      </motion.span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <motion.button
                      onClick={handleCheckout}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Thanh toán</span>
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>

                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="btn-secondary w-full text-center"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </div>

                  {/* Info Note */}
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-slate-400 text-xs">
                      ℹ️ Thanh toán bằng số dư tài khoản. Vui lòng nạp tiền trước khi thanh toán.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
