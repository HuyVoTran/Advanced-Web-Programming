import React, { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, LayoutDashboard, LogOut, MapPin, Settings, ShoppingBag, User, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserDashboardLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

const MENU_ITEMS: Array<{
  icon: LucideIcon;
  label: string;
  path: string;
  description: string;
}> = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', description: 'Tổng quan tài khoản của bạn' },
  { icon: User, label: 'Thông tin cá nhân', path: '/profile', description: 'Cập nhật thông tin tài khoản' },
  { icon: MapPin, label: 'Sổ địa chỉ', path: '/addresses', description: 'Quản lý địa chỉ giao hàng' },
  { icon: ShoppingBag, label: 'Đơn hàng của tôi', path: '/orders', description: 'Xem lịch sử đơn hàng' },
  { icon: Heart, label: 'Yêu thích', path: '/favorites', description: 'Xem các sản phẩm đã lưu' },
  { icon: Settings, label: 'Cài đặt', path: '/settings', description: 'Tùy chỉnh tài khoản' },
];

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  title,
  subtitle,
  icon: HeaderIcon,
  children,
  backTo = '/dashboard',
  backLabel = 'Quay lại Dashboard',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <Link to={backTo} className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#C9A24D] to-[#B8923D] p-6 text-white">
                <img
                  src="/images/SalvioRoyale-Logo.png"
                  alt="Salvio Royale"
                  className="h-10 w-auto object-contain mb-4"
                />
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-xl mb-1">{user.fullName || user.name}</h2>
                <p className="text-white/90 text-sm">{user.email}</p>
              </div>

              <div className="p-4">
                <nav className="space-y-1">
                  {MENU_ITEMS.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                          isActive ? 'bg-[#C9A24D]/10' : 'hover:bg-gray-50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`w-5 h-5 ${isActive ? 'text-[#C9A24D]' : 'text-gray-600 group-hover:text-[#C9A24D]'}`}
                          />
                          <div className="flex-1">
                            <div className={`text-sm ${isActive ? 'text-[#C9A24D]' : 'group-hover:text-[#C9A24D]'}`}>
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </>
                      )}
                    </NavLink>
                  ))}

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors group w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                    <div className="flex-1">
                      <div className="text-sm group-hover:text-red-600">Đăng xuất</div>
                      <div className="text-xs text-gray-500">Thoát khỏi tài khoản</div>
                    </div>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center">
                {HeaderIcon ? <HeaderIcon className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl tracking-wide">{title}</h1>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
