import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset email
    toast.success('Email khôi phục mật khẩu đã được gửi!');
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl mb-2 tracking-wide">Quên Mật Khẩu</h1>
              <p className="text-gray-600">
                Nhập email của bạn để nhận liên kết khôi phục mật khẩu
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors mb-4"
                >
                  Gửi Liên Kết Khôi Phục
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
                  <p className="text-green-800 mb-2">
                    ✓ Email đã được gửi thành công!
                  </p>
                  <p className="text-sm text-green-700">
                    Vui lòng kiểm tra hộp thư của bạn ({email}) và làm theo hướng dẫn để đặt lại mật khẩu.
                  </p>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Không nhận được email?{' '}
                  <button
                    onClick={() => {
                      toast.success('Email đã được gửi lại!');
                    }}
                    className="text-[#C9A24D] hover:underline"
                  >
                    Gửi lại
                  </button>
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#C9A24D] hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
