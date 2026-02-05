import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice } from '@/data/mockData';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipping': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
            <h2 className="text-3xl font-light mb-4">Chưa có đơn hàng</h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa có đơn hàng nào
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                <p>Giao đến: {order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>
                  {order.shippingAddress.address}, {order.shippingAddress.ward},{' '}
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
