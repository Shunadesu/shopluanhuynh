import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser, FiX } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AuthDrawer = ({ isOpen, onClose, initialView = 'login' }) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [view, setView] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const password = watch('password');

  // Reset when drawer opens/closes or initialView changes
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setShowOtpInput(false);
      setEmail('');
      setUserId('');
      reset();
    }
  }, [isOpen, initialView, reset]);

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

  // Login handler
  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      toast.success('Đăng nhập thành công!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      setEmail(data.email);
      setUserId(res.data.userId);
      setShowOtpInput(true);

      // Alert OTP for demo
      alert(`🔑 Mã OTP của bạn: ${res.data.otp}\n\nMã có hiệu lực trong 5 phút.`);
      
      toast.success('Đăng ký thành công! Vui lòng nhập mã OTP.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP 6 số');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { userId, otp });
      toast.success('Xác thực thành công! Bạn có thể đăng nhập.');
      setShowOtpInput(false);
      setUserId('');
      setView('login');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { userId });

      // Alert OTP for demo
      alert(`🔑 Mã OTP mới: ${res.data.otp}\n\nMã có hiệu lực trong 5 phút.`);
      
      toast.success('Đã gửi lại mã OTP');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setIsLoading(false);
    }
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

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.4
      }
    }
  };

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
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[40vw] bg-dark-light border-l border-slate-700 shadow-2xl overflow-y-auto"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="sticky top-0 bg-dark-light border-b border-slate-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                {showOtpInput ? 'Xác thực OTP' : view === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <motion.div 
              className="p-6"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {showOtpInput ? (
                /* OTP Verification Form */
                <div>
                  <p className="text-slate-400 mb-4">
                    Mã OTP đã được gửi đến <span className="text-primary">{email}</span>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="btn-primary w-full"
                    >
                      {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="btn-secondary w-full"
                    >
                      Gửi lại mã OTP
                    </button>
                  </form>
                </div>
              ) : view === 'login' ? (
                /* Login Form */
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email là bắt buộc',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email không hợp lệ'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-300 mb-2">Mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        {...register('password', {
                          required: 'Mật khẩu là bắt buộc',
                          minLength: {
                            value: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-300 mb-2">Họ tên</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        {...register('fullName', {
                          required: 'Họ tên là bắt buộc',
                          minLength: {
                            value: 2,
                            message: 'Họ tên phải có ít nhất 2 ký tự'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email là bắt buộc',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email không hợp lệ'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-300 mb-2">Mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        {...register('password', {
                          required: 'Mật khẩu là bắt buộc',
                          minLength: {
                            value: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-slate-300 mb-2">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        {...register('confirmPassword', {
                          required: 'Vui lòng xác nhận mật khẩu',
                          validate: value => value === password || 'Mật khẩu không khớp'
                        })}
                        className="input-field pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                  </button>
                </form>
              )}

              {/* View Toggle */}
              {!showOtpInput && (
                <>
                  <div className="mt-6 text-center">
                    {view === 'login' ? (
                      <p className="text-slate-400">
                        Chưa có tài khoản?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setView('register');
                            setUserId('');
                            reset();
                          }}
                          className="text-primary hover:text-primary-light font-medium"
                        >
                          Đăng ký ngay
                        </button>
                      </p>
                    ) : (
                      <p className="text-slate-400">
                        Đã có tài khoản?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setView('login');
                            setUserId('');
                            reset();
                          }}
                          className="text-primary hover:text-primary-light font-medium"
                        >
                          Đăng nhập
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Facebook Login - Coming Soon */}
                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-dark-light text-slate-400">Hoặc</span>
                    </div>
                  </div>

                  <button
                    disabled
                    onClick={() => toast.success('Tính năng đang phát triển')}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg cursor-not-allowed opacity-50"
                    title="Tính năng đang phát triển"
                  >
                    <FaFacebook className="w-5 h-5" />
                    <span>Đăng nhập với Facebook</span>
                    <span className="text-xs bg-blue-500/30 px-2 py-0.5 rounded">Sắp ra mắt</span>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthDrawer;
