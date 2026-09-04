import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', data);
      setEmail(data.email);
      setShowOtpInput(true);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
      
      // For development: Show OTP in console
      console.log('Check server console for OTP code');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP 6 số');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Xác thực thành công! Bạn có thể đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Đã gửi lại mã OTP');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpInput) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="card">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Xác thực OTP</h1>
                <p className="text-slate-400">
                  Mã OTP đã được gửi đến <span className="text-primary">{email}</span>
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  (Trong môi trường dev, kiểm tra console server để lấy mã OTP)
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-2">
                <div>
                  <label className="block text-slate-300 mb-2">Mã OTP (6 số)</label>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
              <p className="text-slate-400">Tạo tài khoản mới</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
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

              {/* Phone */}
              <div>
                <label className="block text-slate-300 mb-2">Số điện thoại (tùy chọn)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input-field pl-10"
                    placeholder="0123456789"
                  />
                </div>
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

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:text-primary-light">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
