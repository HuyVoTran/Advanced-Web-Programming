import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, User } from 'lucide-react';
import { mockOrders, formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from '../../../data/mockData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id);

  const [status, setStatus] = useState(order?.status || 'pending');

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/admin/orders" className="text-[#C9A24D] hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    toast.success('Cập nhật trạng thái đơn hàng thành công!');
    // In real app, would call API
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 tracking-wide">Chi Tiết Đơn Hàng</h1>
            <p className="text-gray-600">Mã đơn: {order.orderNumber}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Sản Phẩm</h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{item.productName}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Số lượng: {item.quantity}</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg pt-2">
                <span>Tổng cộng:</span>
                <span className="text-[#C9A24D]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Cập Nhật Trạng Thái</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
              >
                Cập Nhật Trạng Thái
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Khách Hàng</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Họ tên:</div>
                <div>{order.customerName}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Email:</div>
                <div>{order.customerEmail}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Số điện thoại:</div>
                <div>{order.customerPhone}</div>
              </div>
              {!order.userId && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    Khách vãng lai (Guest)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Địa Chỉ Giao Hàng</h2>
            </div>

            <p className="text-sm">{order.shippingAddress}</p>

            {order.note && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-gray-600 text-sm mb-1">Ghi chú:</div>
                <p className="text-sm">{order.note}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Thanh Toán</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Phương thức:</div>
                <div>{getPaymentMethodText(order.paymentMethod)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Ngày đặt:</div>
                <div>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Cập nhật lần cuối:</div>
                <div>{format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
