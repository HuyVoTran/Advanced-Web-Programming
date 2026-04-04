import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice, getStatusText, getStatusColor } from '@/utils/constants';
import { Package } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { notify } from '@/utils/notifications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserOrders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

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

  const canCancelOrder = (status: string) => ['pending', 'confirmed'].includes(status);

  const openCancelDialog = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    const trimmedReason = cancelReason.trim();
    if (!orderToCancel || !trimmedReason) {
      notify.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      setCancellingOrderId(orderToCancel);
      await updateOrderStatus(orderToCancel, 'cancelled', { cancelReason: trimmedReason });
      notify.orderCancelled(orderToCancel);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
    } catch (error) {
      notify.error('Không thể hủy đơn hàng', 'Vui lòng thử lại sau.');
    } finally {
      setCancellingOrderId(null);
    }
  };

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

              <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end gap-3">
                {order.status === 'completed' && (
                  <Link
                    to={`/returns?orderId=${order.id}`}
                    className="inline-block border border-[#C9A24D] text-[#C9A24D] px-4 py-2 text-sm tracking-wide uppercase hover:bg-[#C9A24D]/10 transition-colors duration-300 rounded"
                  >
                    Yêu cầu trả hàng
                  </Link>
                )}
                {canCancelOrder(order.status) && (
                  <button
                    type="button"
                      onClick={() => openCancelDialog(order.id)}
                    disabled={cancellingOrderId === order.id}
                    className="inline-block border border-red-300 text-red-600 px-4 py-2 text-sm tracking-wide uppercase hover:bg-red-50 transition-colors duration-300 rounded disabled:opacity-50"
                  >
                    {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                  </button>
                )}
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

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy đơn hàng</DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do hủy đơn hàng để hệ thống ghi nhận.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="cancel-reason" className="text-sm text-gray-700">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Tôi muốn đổi sản phẩm khác..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500 text-right">{cancelReason.length}/500</p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCancelDialogOpen(false);
                  setOrderToCancel(null);
                  setCancelReason('');
                }}
              >
                Đóng
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || !!cancellingOrderId}
              >
                {cancellingOrderId ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </UserDashboardLayout>
  );
};
