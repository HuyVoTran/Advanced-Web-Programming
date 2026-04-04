import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { returnsAPI } from '@/services/api';
import { formatPrice } from '@/utils/constants';
import { notify } from '@/utils/notifications';

export const Returns: React.FC = () => {
  const { user, token } = useAuth();
  const { getAllOrders } = useOrders();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(searchParams.get('orderId') || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const allOrders = getAllOrders();
  const completedOrders = useMemo(() => allOrders.filter((order) => order.status === 'completed'), [allOrders]);
  const selectedOrder = completedOrders.find((order) => order.id === selectedOrderId);

  const loadRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data: any = await returnsAPI.getMine(token);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      notify.error('Không thể tải yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true });
      return;
    }
    loadRequests();
  }, [user, token, navigate]);

  useEffect(() => {
    setSelectedOrderId(searchParams.get('orderId') || '');
  }, [searchParams]);

  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!token || !selectedOrderId || !trimmedReason) {
      notify.error('Vui lòng chọn đơn hàng và nhập lý do');
      return;
    }

    try {
      setSubmitting(true);
      await returnsAPI.create({ orderId: selectedOrderId, reason: trimmedReason }, token);
      notify.success('Đã gửi yêu cầu trả hàng');
      setReason('');
      setSearchParams({});
      setSelectedOrderId('');
      await loadRequests();
    } catch (error) {
      notify.error('Không thể gửi yêu cầu trả hàng', error instanceof Error ? error.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserDashboardLayout
      title="Trả hàng"
      subtitle="Gửi và theo dõi yêu cầu trả hàng sau khi đơn hoàn thành"
      icon={RotateCcw}
      backTo="/orders"
      backLabel="Quay lại đơn hàng"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg mb-1">Tạo yêu cầu trả hàng</h2>
            <p className="text-sm text-gray-500">Chọn đơn đã hoàn thành và mô tả lý do để bộ phận CSKH xử lý nhanh hơn.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Đơn hàng hoàn thành</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Chọn đơn hàng</option>
              {completedOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id} - {formatPrice(order.total)}
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm text-gray-600">
              <p className="text-gray-900">Chi tiết đơn #{selectedOrder.id}</p>
              {selectedOrder.items.map((item) => (
                <div key={`${selectedOrder.id}-${item.productId}`} className="flex justify-between gap-3">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>{formatPrice((item.finalPrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Lý do trả hàng</label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Ví dụ: Sản phẩm không đúng kỳ vọng, muốn đổi mẫu khác..."
            />
            <p className="text-xs text-gray-400 text-right">{reason.length}/1000</p>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSubmit} disabled={!selectedOrderId || !reason.trim() || submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu trả hàng'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg">Lịch sử yêu cầu</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Đang tải yêu cầu trả hàng...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Bạn chưa có yêu cầu trả hàng nào.</div>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-gray-900">Đơn #{request.orderId?._id || request.orderId}</p>
                      <p className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wide text-gray-700">
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.reason}</p>
                  {request.adminNote && <p className="text-sm text-[#C9A24D]">Ghi chú CSKH: {request.adminNote}</p>}
                  <div className="text-sm text-gray-600 space-y-1">
                    {request.items?.map((item: any) => (
                      <div key={`${request._id}-${item.product}`} className="flex justify-between gap-3">
                        <span>{item.productName}</span>
                        <span>x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};
