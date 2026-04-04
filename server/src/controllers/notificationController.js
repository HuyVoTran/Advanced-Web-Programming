import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../utils/response.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để xem thông báo');
    }

    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return sendResponse(res, 200, 'Thông báo được lấy thành công', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để xem thông báo');
    }

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return sendResponse(res, 200, 'Số lượng thông báo chưa đọc được lấy thành công', { unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để cập nhật thông báo');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Thông báo không tìm thấy');
    }

    return sendResponse(res, 200, 'Đã đánh dấu thông báo là đã đọc', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để cập nhật thông báo');
    }

    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    return sendResponse(res, 200, 'Đã đánh dấu tất cả thông báo là đã đọc');
  } catch (error) {
    next(error);
  }
};