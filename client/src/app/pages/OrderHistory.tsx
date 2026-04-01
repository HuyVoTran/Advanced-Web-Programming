import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice, getStatusText, getStatusColor } from '@/utils/constants';
import { Package } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const userId = user.id || user._id;
  const orders = userId ? getUserOrders(userId) : [];

  return (
    <UserDashboardLayout
      title="Lịch sử đơn hàng"
      subtitle="Theo dõi toàn bộ đơn hàng của bạn"
      icon={Package}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="text-lg">{order.id}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productName} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-lg text-[#C9A24D]">{formatPrice(order.total)}</span>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Giao đến: {order.shippingAddress.fullName || order.guestInfo?.name}</p>
                <p>{order.shippingAddress.phone || order.guestInfo?.phone}</p>
                <p>
                  {order.shippingAddress.address || ''}
                  {order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}
                  {order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}
                  {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-block bg-[#C9A24D] text-white px-4 py-2 text-sm tracking-wide uppercase hover:bg-[#b8923f] transition-colors duration-300 rounded"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
    </UserDashboardLayout>
  );
};
