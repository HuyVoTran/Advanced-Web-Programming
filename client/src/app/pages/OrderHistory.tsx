import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice, getStatusText, getStatusColor } from '@/utils/constants';
import { Package } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const orders = getUserOrders(user.id);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-light mb-12 tracking-wide">Lịch sử đơn hàng</h1>

        <div className="space-y-6 max-w-4xl">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
