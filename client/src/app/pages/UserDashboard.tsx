import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { formatPrice, getStatusText, getStatusColor } from '@/utils/constants';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ordersAPI } from '@/services/api';

export const UserDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        if (token) {
          const response = await ordersAPI.getUserOrders(token);
          setUserOrders(response?.data?.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const menuItems = [
    { icon: User, label: 'Thông tin cá nhân', path: '/profile', description: 'Cập nhật thông tin tài khoản' },
    { icon: MapPin, label: 'Sổ địa chỉ', path: '/addresses', description: 'Quản lý địa chỉ giao hàng' },
    { icon: ShoppingBag, label: 'Đơn hàng của tôi', path: '/orders', description: 'Xem lịch sử đơn hàng' },
    { icon: Settings, label: 'Cài đặt', path: '/settings', description: 'Tùy chỉnh tài khoản' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 tracking-wide">Xin chào, {user?.fullName || 'Khách hàng'}!</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
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
                <h2 className="text-xl mb-1">{user?.fullName}</h2>
                <p className="text-white/90 text-sm">{user?.email}</p>
              </div>

              <div className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <item.icon className="w-5 h-5 text-gray-600 group-hover:text-[#C9A24D]" />
                      <div className="flex-1">
                        <div className="text-sm group-hover:text-[#C9A24D]">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
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

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tổng đơn hàng</span>
                  <ShoppingBag className="w-5 h-5 text-[#C9A24D]" />
                </div>
                <div className="text-2xl">{userOrders.length}</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Đang xử lý</span>
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl">
                  {userOrders.filter(o => ['pending', 'confirmed', 'shipping'].includes(o.status)).length}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Hoàn thành</span>
                  <ShoppingBag className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl">
                  {userOrders.filter(o => o.status === 'delivered').length}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Đơn Hàng Gần Đây</h2>
                <Link to="/orders" className="text-[#C9A24D] hover:underline text-sm">
                  Xem tất cả →
                </Link>
              </div>

              {userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#C9A24D] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm mb-1">Đơn hàng #{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {item.productName} x{item.quantity}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">Tổng tiền:</div>
                        <div className="text-[#C9A24D]">{formatPrice(order.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
                  <Link
                    to="/products"
                    className="inline-block bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
                  >
                    Khám Phá Sản Phẩm
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/profile"
                className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <User className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-lg mb-2">Cập nhật thông tin</h3>
                <p className="text-sm text-gray-600">Chỉnh sửa thông tin cá nhân của bạn</p>
              </Link>

              <Link
                to="/addresses"
                className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <MapPin className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="text-lg mb-2">Quản lý địa chỉ</h3>
                <p className="text-sm text-gray-600">Thêm hoặc chỉnh sửa địa chỉ giao hàng</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};