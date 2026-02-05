import React from 'react';
import { Settings, Bell, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const UserSettings: React.FC = () => {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    promotions: true,
  });

  const handleSave = () => {
    toast.success('Cài đặt đã được lưu!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl tracking-wide">Cài Đặt</h1>
            <p className="text-gray-600">Tùy chỉnh trải nghiệm của bạn</p>
          </div>
        </div>

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
                  <div className="text-xs text-gray-500">Nhận tin nhắn về đơn hàng</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
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
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="text-sm mb-1">Đổi mật khẩu</div>
                  <div className="text-xs text-gray-500">Cập nhật mật khẩu của bạn</div>
                </div>
                <button
                  onClick={() => toast.info('Tính năng đang phát triển')}
                  className="text-[#C9A24D] hover:underline text-sm"
                >
                  Thay đổi
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="text-sm mb-1">Xác thực hai yếu tố</div>
                  <div className="text-xs text-gray-500">Bảo vệ tài khoản tốt hơn</div>
                </div>
                <button
                  onClick={() => toast.info('Tính năng đang phát triển')}
                  className="text-[#C9A24D] hover:underline text-sm"
                >
                  Bật
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm mb-1">Phiên đăng nhập</div>
                  <div className="text-xs text-gray-500">Quản lý các thiết bị đã đăng nhập</div>
                </div>
                <button
                  onClick={() => toast.info('Tính năng đang phát triển')}
                  className="text-[#C9A24D] hover:underline text-sm"
                >
                  Xem
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
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Múi giờ</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]">
                  <option value="asia/saigon">Asia/Ho Chi Minh (GMT+7)</option>
                  <option value="asia/bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Tiền tệ</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]">
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
              className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
