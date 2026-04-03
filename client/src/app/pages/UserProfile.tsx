import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { authAPI } from '@/services/api';

export const UserProfile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return;
    }

    try {
      setSaving(true);
      const result: any = await authAPI.updateProfile(
        {
          fullName: formData.fullName,
          phone: formData.phone,
        },
        token
      );

      const updatedUser = result?.user || result;
      if (updatedUser) {
        updateUser({
          fullName: updatedUser.fullName,
          name: updatedUser.fullName,
          phone: updatedUser.phone,
          addresses: updatedUser.addresses || user?.addresses || [],
          settings: updatedUser.settings || user?.settings,
        });
      }

      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <UserDashboardLayout
      title="Thông Tin Cá Nhân"
      subtitle="Quản lý thông tin tài khoản của bạn"
      icon={User}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
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
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi tại đây</p>
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
                      disabled={saving}
                      className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
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
                      disabled={saving}
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
              Nhấn vào đây để thay đổi mật khẩu (Đang phát triển) →
            </button>
          </div>
        </div>
    </UserDashboardLayout>
  );
};
