import React from 'react';
import { Settings, Bell, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { getPreferredCurrency, setPreferredCurrency } from '@/utils/constants';

export const UserSettings: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [notifications, setNotifications] = React.useState({
    email: user?.settings?.notifications?.email ?? true,
    sms: false,
    promotions: user?.settings?.notifications?.promotions ?? true,
  });
  const [language, setLanguage] = React.useState(user?.settings?.language || 'vi');
  const [timezone, setTimezone] = React.useState(user?.settings?.timezone || 'asia/saigon');
  const [currency, setCurrency] = React.useState(
    getPreferredCurrency((user?.settings?.currency as 'vnd' | 'usd') || 'vnd')
  );
  const [saving, setSaving] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = React.useState(false);

  React.useEffect(() => {
    setNotifications({
      email: user?.settings?.notifications?.email ?? true,
      sms: false,
      promotions: user?.settings?.notifications?.promotions ?? true,
    });
    setLanguage(user?.settings?.language || 'vi');
    setTimezone(user?.settings?.timezone || 'asia/saigon');
    setCurrency(getPreferredCurrency((user?.settings?.currency as 'vnd' | 'usd') || 'vnd'));
  }, [user]);

  React.useEffect(() => {
    const syncCurrency = () => {
      setCurrency(getPreferredCurrency((user?.settings?.currency as 'vnd' | 'usd') || 'vnd'));
    };

    window.addEventListener('storage', syncCurrency);
    window.addEventListener('luxury_jewelry_currency_change', syncCurrency as EventListener);

    return () => {
      window.removeEventListener('storage', syncCurrency);
      window.removeEventListener('luxury_jewelry_currency_change', syncCurrency as EventListener);
    };
  }, [user?.settings?.currency]);

  const handleSave = async () => {
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return;
    }

    try {
      setSaving(true);
      const settingsPayload = {
        notifications: {
          ...notifications,
          sms: false,
        },
        language,
        timezone,
        currency,
      };

      const result: any = await authAPI.updateProfile({ settings: settingsPayload }, token);
      const updatedUser = result?.user || result;

      setPreferredCurrency((updatedUser?.settings?.currency || currency) as 'vnd' | 'usd', user?.id);

      updateUser({
        settings: updatedUser?.settings || settingsPayload,
      });

      toast.success('Cài đặt đã được lưu!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || 'Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin đổi mật khẩu');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setChangingPassword(true);
      await authAPI.changePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        },
        token
      );

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Đổi mật khẩu thành công');
    } catch (error: any) {
      toast.error(error?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <UserDashboardLayout
      title="Cài Đặt"
      subtitle="Tùy chỉnh trải nghiệm của bạn"
      icon={Settings}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Thông Báo</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm mb-1">Thông báo qua Email</div>
                  <div className="text-xs text-gray-500">Nhận cập nhật đơn hàng qua email</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm mb-1">Thông báo qua SMS</div>
                  <div className="text-xs text-gray-500">Tính năng SMS hiện chưa được hỗ trợ</div>
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm mb-1">Khuyến mãi và ưu đãi</div>
                  <div className="text-xs text-gray-500">Nhận thông tin về sản phẩm mới và khuyến mãi</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.promotions}
                  onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Bảo Mật</h2>
            </div>

            <div className="space-y-4">
              <div className="py-3 border-b border-gray-200">
                <div className="mb-3">
                  <div className="text-sm mb-1">Đổi mật khẩu</div>
                  <div className="text-xs text-gray-500">Cập nhật mật khẩu tài khoản của bạn</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  />
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  />
                </div>

                <div className="mt-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-[#C9A24D] text-white hover:bg-[#B8923D] transition-colors disabled:opacity-60"
                  >
                    {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="text-sm mb-1">Xác thực hai yếu tố</div>
                  <div className="text-xs text-gray-500">Chưa hỗ trợ trên hệ thống hiện tại (Đang phát triển)</div>
                </div>
                <button
                  disabled
                  className="text-gray-400 text-sm cursor-not-allowed"
                >
                  (Đang phát triển)
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm mb-1">Phiên đăng nhập</div>
                  <div className="text-xs text-gray-500">Quản lý đa thiết bị chưa được bật (Đang phát triển)</div>
                </div>
                <button
                  disabled
                  className="text-gray-400 text-sm cursor-not-allowed"
                >
                  (Đang phát triển)
                </button>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Ngôn Ngữ & Khu Vực</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Ngôn ngữ</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Múi giờ</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                >
                  <option value="asia/saigon">Asia/Ho Chi Minh (GMT+7)</option>
                  <option value="asia/bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Tiền tệ</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    const nextCurrency = e.target.value as 'vnd' | 'usd';
                    if (nextCurrency === currency) {
                      return;
                    }
                    setCurrency(nextCurrency);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                >
                  <option value="vnd">VNĐ - Đồng Việt Nam</option>
                  <option value="usd">USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
    </UserDashboardLayout>
  );
};
