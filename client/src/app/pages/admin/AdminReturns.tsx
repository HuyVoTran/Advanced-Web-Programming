import React, { useEffect, useState } from 'react';
import adminApi from '@/services/adminApi';
import { notify } from '@/utils/notifications';
import { Button } from '@/app/components/ui/button';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'resolved'];

export const AdminReturns: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: string; adminNote: string }>>({});

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllReturns();
      const normalizedData = Array.isArray(data) ? data : [];
      setRequests(normalizedData);
      setDrafts(
        normalizedData.reduce((acc: Record<string, { status: string; adminNote: string }>, item: any) => {
          acc[item._id] = { status: item.status, adminNote: item.adminNote || '' };
          return acc;
        }, {})
      );
    } catch (error) {
      notify.error('Không thể tải danh sách trả hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSave = async (requestId: string) => {
    const draft = drafts[requestId];
    if (!draft) return;

    try {
      setSavingId(requestId);
      await adminApi.updateReturnStatus(requestId, draft.status, draft.adminNote);
      notify.success('Đã cập nhật yêu cầu trả hàng');
      await loadRequests();
    } catch (error) {
      notify.error('Không thể cập nhật yêu cầu trả hàng');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl tracking-wide">Quản lý trả hàng</h1>
        <p className="text-gray-500 mt-1">Duyệt và cập nhật trạng thái các yêu cầu trả hàng từ khách hàng.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Đang tải yêu cầu trả hàng...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có yêu cầu trả hàng nào.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => {
              const draft = drafts[request._id] || { status: request.status, adminNote: request.adminNote || '' };
              return (
                <div key={request._id} className="p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg text-gray-900">Đơn #{request.order?._id || request.orderId}</h2>
                      <p className="text-sm text-gray-500">
                        {request.user?.fullName || 'Khách hàng'} · {request.user?.email || 'Không có email'}
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wide text-gray-700">
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div className="lg:col-span-2 space-y-2">
                      <p className="text-gray-700"><span className="text-gray-500">Lý do:</span> {request.reason}</p>
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-1">
                        {request.items?.map((item: any) => (
                          <div key={`${request._id}-${item.product}`} className="flex justify-between gap-3 text-gray-600">
                            <span>{item.productName}</span>
                            <span>x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [request._id]: { ...draft, status: event.target.value },
                          }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <textarea
                        value={draft.adminNote}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [request._id]: { ...draft, adminNote: event.target.value },
                          }))
                        }
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Ghi chú nội bộ / phản hồi cho khách hàng"
                      />
                      <Button type="button" onClick={() => handleSave(request._id)} disabled={savingId === request._id}>
                        {savingId === request._id ? 'Đang lưu...' : 'Lưu cập nhật'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
