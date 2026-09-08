import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiLock, FiX, FiAtSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AuthDrawer = ({ isOpen, onClose, initialView = 'login' }) => {
  const { login } = useAuthStore();
  const [view, setView] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const password = watch('password');

  // Reset when drawer opens/closes or initialView changes
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
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

  // Register handler - đăng ký xong auto login
  const handleRegister = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        toast.success('Đăng ký thành công!');
        onClose();
      } else {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setView('login');
        reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
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
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[40vw] bg-white dark:bg-dark-light border-l border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-light border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {view === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <motion.div
              className="p-6"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {view === 'login' ? (
                /* Login Form */
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Tên đăng nhập</label>
                    <div className="relative">
                      <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="text"
                        autoComplete="username"
                        {...register('username', {
                          required: 'Tên đăng nhập là bắt buộc',
                          minLength: {
                            value: 3,
                            message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Chỉ chứa chữ cái, số và dấu gạch dưới'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="password"
                        autoComplete="current-password"
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
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Họ tên</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="text"
                        autoComplete="name"
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

                  {/* Username */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Tên đăng nhập</label>
                    <div className="relative">
                      <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="text"
                        autoComplete="username"
                        {...register('username', {
                          required: 'Tên đăng nhập là bắt buộc',
                          minLength: {
                            value: 3,
                            message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                          },
                          maxLength: {
                            value: 20,
                            message: 'Tên đăng nhập tối đa 20 ký tự'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Chỉ chứa chữ cái, số và dấu gạch dưới'
                          }
                        })}
                        className="input-field pl-10"
                        placeholder="username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="password"
                        autoComplete="new-password"
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
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
                      <input
                        type="password"
                        autoComplete="new-password"
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
              <div className="mt-6 text-center">
                {view === 'login' ? (
                  <p className="text-slate-500 dark:text-slate-400">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setView('register');
                        reset();
                      }}
                      className="text-primary hover:text-primary-light font-medium"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        reset();
                      }}
                      className="text-primary hover:text-primary-light font-medium"
                    >
                      Đăng nhập
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthDrawer;
