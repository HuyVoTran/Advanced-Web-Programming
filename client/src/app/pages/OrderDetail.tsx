import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice, getStatusColor, getStatusText } from '@/utils/constants';
import { ArrowLeft, Package } from 'lucide-react';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrderById } = useOrders();

  const order = id ? getOrderById(id) : undefined;

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-xl mb-2">Không tìm thấy đơn hàng</p>
            <p className="text-gray-600 mb-6">Đơn hàng có thể chưa được tải hoặc không tồn tại.</p>
            <Link
              to="/orders"
              className="inline-block bg-[#C9A24D] text-white px-6 py-3 rounded hover:bg-[#b8923f] transition-colors"
            >
              Quay lại lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/orders" className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử đơn hàng
          </Link>
          <h1 className="text-4xl font-light tracking-wide">Chi tiết đơn hàng</h1>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="text-lg font-medium">{order.id}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm w-fit ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl mb-4">Sản phẩm</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p>{item.productName}</p>
                    <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                  </div>
                </div>
                <p>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
            <span className="font-medium">Tổng cộng</span>
            <span className="text-lg text-[#C9A24D]">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl mb-4">Thông tin giao hàng</h2>
          <div className="text-gray-700 space-y-1">
            <p>{order.shippingAddress.fullName || order.guestInfo?.name}</p>
            <p>{order.shippingAddress.phone || order.guestInfo?.phone}</p>
            <p>
              {order.shippingAddress.address || ''}
              {order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}
              {order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}
              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Phương thức thanh toán</p>
            <p>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
