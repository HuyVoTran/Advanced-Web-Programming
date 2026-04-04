import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI } from '@/services/api';
import { notify } from '@/utils/notifications';

const NOTIFICATIONS_UPDATED_EVENT = 'notifications-updated';

export const Notifications: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response: any = await notificationsAPI.getAll(token);
      setNotifications(Array.isArray(response?.notifications) ? response.notifications : []);
    } catch (error) {
      notify.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true });
      return;
    }
    loadNotifications();
  }, [user, token, navigate]);

  if (!user) {
    return null;
  }

  const dispatchUpdateEvent = () => {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!token) return;
    try {
      await notificationsAPI.markRead(notificationId, token);
      setNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
      dispatchUpdateEvent();
    } catch (error) {
      notify.error('Không thể cập nhật thông báo');
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      setMarkingAll(true);
      await notificationsAPI.markAllRead(token);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      dispatchUpdateEvent();
      notify.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      notify.error('Không thể cập nhật tất cả thông báo');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <UserDashboardLayout
      title="Thông báo"
      subtitle="Theo dõi cập nhật đơn hàng, trả hàng và hoạt động tài khoản"
      icon={Bell}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg">Trung tâm thông báo</h2>
            <p className="text-sm text-gray-500">Các cập nhật mới nhất dành cho tài khoản của bạn.</p>
          </div>
          <Button type="button" variant="outline" onClick={handleMarkAllRead} disabled={markingAll || notifications.length === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            {markingAll ? 'Đang cập nhật...' : 'Đọc tất cả'}
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Bạn chưa có thông báo nào.</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`p-5 transition-colors ${item.isRead ? 'bg-white' : 'bg-[#C9A24D]/5'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!item.isRead && <span className="inline-block w-2 h-2 rounded-full bg-[#C9A24D]" />}
                      <h3 className="text-base text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{item.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.link && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!item.isRead) {
                            handleMarkRead(item._id);
                          }
                          navigate(item.link);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                    {!item.isRead && (
                      <Button type="button" onClick={() => handleMarkRead(item._id)}>
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
};
