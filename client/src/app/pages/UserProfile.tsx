import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { toast } from 'sonner';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl tracking-wide">Thông Tin Cá Nhân</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
                    >
                      Lưu Thay Đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: user?.fullName || user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
                  >
                    Chỉnh Sửa Thông Tin
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg mb-4">Thay Đổi Mật Khẩu</h3>
            <button
              onClick={() => toast.info('Tính năng đang phát triển')}
              className="text-[#C9A24D] hover:underline"
            >
              Nhấn vào đây để thay đổi mật khẩu →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
