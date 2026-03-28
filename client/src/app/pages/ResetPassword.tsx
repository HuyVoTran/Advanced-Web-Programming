import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Vui lòng nhập email và mã OTP');
      return;
    }
    try {
      setIsSubmitting(true);
      await authAPI.resetPassword(email, otp, password, confirmPassword);
      toast.success('Đặt lại mật khẩu thành công');
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl mb-2 tracking-wide">Đặt Lại Mật Khẩu</h1>
              <p className="text-gray-600">Nhập email, mã OTP và mật khẩu mới</p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Mã OTP (6 số) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                      required
                      disabled={isSubmitting}
                      placeholder="Nhập 6 chữ số"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-[#C9A24D] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <p className="text-green-800 mb-2">✓ Cập nhật mật khẩu thành công!</p>
                  <p className="text-sm text-green-700">
                    Bạn có thể đăng nhập lại với mật khẩu mới.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Đến trang đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
