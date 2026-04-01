import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, User, AlertCircle, X } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '../../../hooks/useCustomHooks';
import { adminApi } from '../../../services/adminApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { Textarea } from '../../components/ui/textarea';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_TEXT: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

interface OrderDetail {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  itemCount: number;
  totalPrice: number;
  shippingAddress: {
    street: string;
    ward: string;
    district: string;
    city: string;
    fullAddress: string;
  };
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function formatAddress(addr: any): string {
  if (!addr) return '';
  return `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`;
}

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newStatus, setNewStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);

  const { data: order, loading, error } = useAdminFetch<OrderDetail>(
    () => adminApi.getOrderById(id!),
    [id]
  );

  const { mutate: updateStatus, loading: updateLoading } = useAdminMutation(
    (status: string) => adminApi.updateOrderStatus(id!, status)
  );

  React.useEffect(() => {
    if (order?.status) {
      setNewStatus(order.status);
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    try {
      await updateStatus(newStatus);
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleApproveOrder = async () => {
    try {
      await updateStatus('confirmed');
      toast.success('Đơn hàng đã được phê duyệt!');
      setShowRejectForm(false);
    } catch (err) {
      toast.error('Phê duyệt đơn hàng thất bại');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      // Call a reject endpoint with reason
      await adminApi.rejectOrder(id!, rejectionReason);
      toast.success('Đơn hàng đã bị từ chối!');
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (err) {
      toast.error('Từ chối đơn hàng thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap gap-3 mb-6">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-red-800 font-medium">Lỗi</p>
          <p className="text-red-700 text-sm">{error || 'Không tìm thấy đơn hàng'}</p>
          <Link to="/admin/orders" className="text-red-600 hover:underline text-sm mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
            <p className="text-gray-600">Mã đơn: {order._id}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
            {STATUS_TEXT[order.status] || order.status}
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
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg pt-2">
                <span>Tổng cộng:</span>
                <span className="text-[#C9A24D]">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Cập Nhật Trạng Thái</h2>
            
            {order.status === 'pending' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-4">
                  Đơn hàng này chưa được phê duyệt. Vui lòng chọn hành động:
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleApproveOrder}
                    disabled={updateLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {updateLoading ? 'Đang xử lý...' : 'Phê duyệt đơn hàng'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    disabled={updateLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {showRejectForm && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-red-800">Từ chối đơn hàng</h3>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Textarea
                  placeholder="Nhập lý do từ chối đơn hàng..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <button
                  onClick={handleRejectOrder}
                  disabled={updateLoading || !rejectionReason.trim()}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {updateLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                  disabled={updateLoading}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updateLoading}
                className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
              >
                {updateLoading ? 'Đang cập nhật...' : 'Cập Nhật Trạng Thái'}
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
                <div>{order.customerInfo?.fullName || order.user?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Email:</div>
                <div>{order.customerInfo?.email || order.user?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Số điện thoại:</div>
                <div>{order.customerInfo?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#C9A24D]" />
              <h2 className="text-xl">Địa Chỉ Giao Hàng</h2>
            </div>

            <p className="text-sm">{order.shippingAddress?.fullAddress || formatAddress(order.shippingAddress)}</p>

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
              <h2 className="text-xl">Thông Tin Khác</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Phương thức thanh toán:</div>
                <div className="capitalize">{order.paymentMethod || 'N/A'}</div>
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
