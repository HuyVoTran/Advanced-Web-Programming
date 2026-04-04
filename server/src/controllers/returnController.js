import Order from '../models/Order.js';
import ReturnRequest from '../models/ReturnRequest.js';
import { sendResponse, sendError } from '../utils/response.js';
import { createNotification } from '../utils/notification.js';

const formatReturnRequest = (request) => {
  const value = request.toObject ? request.toObject() : request;
  return {
    ...value,
    orderId: value.order?._id || value.order,
    userId: value.user?._id || value.user,
  };
};

export const createReturnRequest = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để gửi yêu cầu trả hàng');
    }

    const { orderId, reason, items = [] } = req.body;
    const trimmedReason = String(reason || '').trim();

    if (!orderId || !trimmedReason) {
      return sendError(res, 400, 'Vui lòng cung cấp đơn hàng và lý do trả hàng');
    }

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    if (String(order.user?._id || order.user || '') !== String(req.user.id)) {
      return sendError(res, 403, 'Bạn không có quyền gửi yêu cầu cho đơn hàng này');
    }

    if (order.status !== 'completed') {
      return sendError(res, 400, 'Chỉ có thể trả hàng với đơn đã hoàn thành');
    }

    const existingOpenRequest = await ReturnRequest.findOne({
      user: req.user.id,
      order: orderId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingOpenRequest) {
      return sendError(res, 400, 'Đơn hàng này đã có yêu cầu trả hàng đang xử lý');
    }

    const selectedItems = (Array.isArray(items) ? items : [])
      .map((item) => {
        const matchedOrderItem = order.items.find(
          (orderItem) => String(orderItem.product?._id || orderItem.product) === String(item.productId)
        );
        if (!matchedOrderItem) return null;

        const quantity = Math.min(
          Number(item.quantity || 1),
          Number(matchedOrderItem.quantity || 1)
        );

        return {
          product: matchedOrderItem.product?._id || matchedOrderItem.product,
          productName: matchedOrderItem.product?.name || 'Sản phẩm',
          quantity: Math.max(1, quantity),
        };
      })
      .filter(Boolean);

    const returnItems = selectedItems.length
      ? selectedItems
      : order.items.map((item) => ({
          product: item.product?._id || item.product,
          productName: item.product?.name || 'Sản phẩm',
          quantity: Number(item.quantity || 1),
        }));

    const request = await ReturnRequest.create({
      user: req.user.id,
      order: order._id,
      items: returnItems,
      reason: trimmedReason,
    });

    await createNotification({
      userId: req.user.id,
      type: 'return',
      title: 'Đã ghi nhận yêu cầu trả hàng',
      message: `Yêu cầu trả hàng cho đơn #${order._id} đã được gửi thành công.`,
      link: `/returns`,
      metadata: { orderId: String(order._id), returnRequestId: String(request._id) },
    });

    const populatedRequest = await ReturnRequest.findById(request._id).populate('order').populate('user', 'fullName email');
    return sendResponse(res, 201, 'Yêu cầu trả hàng đã được tạo thành công', formatReturnRequest(populatedRequest || request));
  } catch (error) {
    next(error);
  }
};

export const getMyReturnRequests = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để xem yêu cầu trả hàng');
    }

    const requests = await ReturnRequest.find({ user: req.user.id })
      .populate('order')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Yêu cầu trả hàng được lấy thành công', requests.map(formatReturnRequest));
  } catch (error) {
    next(error);
  }
};

export const getAllReturnRequestsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await ReturnRequest.find(filter)
      .populate('order')
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Danh sách yêu cầu trả hàng được lấy thành công', requests.map(formatReturnRequest));
  } catch (error) {
    next(error);
  }
};

export const updateReturnRequestStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote = '' } = req.body;

    if (!['pending', 'approved', 'rejected', 'resolved'].includes(status)) {
      return sendError(res, 400, 'Trạng thái yêu cầu trả hàng không hợp lệ');
    }

    const request = await ReturnRequest.findById(id).populate('order').populate('user', 'fullName email');
    if (!request) {
      return sendError(res, 404, 'Yêu cầu trả hàng không tìm thấy');
    }

    request.status = status;
    request.adminNote = String(adminNote || '').trim();
    await request.save();

    await createNotification({
      userId: request.user?._id || request.user,
      type: 'return',
      title: 'Yêu cầu trả hàng đã được cập nhật',
      message: `Yêu cầu trả hàng cho đơn #${request.order?._id || request.order} hiện ở trạng thái ${status}.`,
      link: '/returns',
      metadata: { returnRequestId: String(request._id), orderId: String(request.order?._id || request.order), status },
    });

    return sendResponse(res, 200, 'Cập nhật yêu cầu trả hàng thành công', formatReturnRequest(request));
  } catch (error) {
    next(error);
  }
};