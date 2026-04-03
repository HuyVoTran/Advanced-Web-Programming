import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * Transform một Order document thành format chuẩn cho frontend.
 */
const formatOrder = (order) => {
  const o = order.toObject ? order.toObject() : order;

  const items = (o.items || []).map((item) => ({
    productId: item.product?._id || item.product,
    productName: item.product?.name || 'Sản phẩm không còn tồn tại',
    price: item.price,
    quantity: item.quantity,
    image: (item.product?.images || [])[0] || '',
  }));

  const ci = o.customerInfo || {};
  const addressParts = [ci.address, ci.ward, ci.district, ci.city].filter(Boolean);
  const shippingAddress = {
    street: ci.address || '',
    ward: ci.ward || '',
    district: ci.district || '',
    city: ci.city || '',
    fullAddress: addressParts.join(', '),
  };

  return {
    ...o,
    itemCount: items.length,
    items,
    shippingAddress,
    note: o.notes || '',
  };
};

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const sendOrderCreatedEmail = async (order) => {
  const customerEmail = order?.customerInfo?.email;
  if (!customerEmail) return;

  const orderId = order?._id?.toString() || order?.id || '';
  const orderCode = `#${orderId}`;
  const orderDetailUrl = `${getClientUrl()}/orders/${orderId}`;

  const html = `
    <p>Xin chào ${order?.customerInfo?.fullName || 'Quý khách'},</p>
    <p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được tạo thành công.</p>
    <p><strong>Tổng thanh toán:</strong> ${formatCurrency(order?.totalPrice)}</p>
    <p>Bạn có thể theo dõi trạng thái đơn hàng tại nút bên dưới:</p>
    <p style="margin:18px 0;">
      <a href="${orderDetailUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Xem chi tiết đơn hàng</a>
    </p>
    <p>Cảm ơn bạn đã mua sắm tại Salvio Royale.</p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Đặt hàng thành công ${orderCode}`,
    html,
  });
};

const sendOrderCancelledEmail = async (order, reason = '') => {
  const customerEmail = order?.customerInfo?.email;
  if (!customerEmail) return;

  const orderId = order?._id?.toString() || order?.id || '';
  const orderCode = `#${orderId}`;
  const orderDetailUrl = `${getClientUrl()}/orders/${orderId}`;
  const finalReason = String(reason || order?.cancelReason || '').trim();

  const html = `
    <p>Xin chào ${order?.customerInfo?.fullName || 'Quý khách'},</p>
    <p>Đơn hàng <strong>${orderCode}</strong> đã được cập nhật sang trạng thái <strong>Đã hủy</strong>.</p>
    ${finalReason ? `<p><strong>Lý do hủy:</strong> ${finalReason}</p>` : ''}
    <p>Bạn có thể xem lại thông tin đơn hàng tại nút bên dưới:</p>
    <p style="margin:18px 0;">
      <a href="${orderDetailUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Xem chi tiết đơn hàng</a>
    </p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Đơn hàng ${orderCode} đã bị hủy`,
    html,
  });
};

export const createOrder = async (req, res, next) => {
  try {
    const { customerInfo, items, paymentMethod, notes } = req.body;

    // Xác thực
    if (!customerInfo || !items || items.length === 0) {
      return sendError(res, 400, 'Vui lòng cung cấp thông tin khách hàng và các mục');
    }

    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      return sendError(res, 400, 'Vui lòng cung cấp thông tin khách hàng đầy đủ');
    }

    // Xác minh các mục và tính tổng cộng
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return sendError(res, 404, `Sản phẩm với ID ${item.productId} không tìm thấy`);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Hàng không đủ cho ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;

      // Giảm kho hàng
      product.stock -= item.quantity;
      await product.save();
    }

    // Tạo đơn hàng
    const order = new Order({
      user: req.user ? req.user.id : null,
      customerInfo,
      items: orderItems,
      totalPrice,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product').populate('user');

    // Xóa giỏ hàng nếu người dùng đã đăng nhập
    if (req.user) {
      const cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    }

    try {
      await sendOrderCreatedEmail(populatedOrder || order);
    } catch (emailError) {
      // eslint-disable-next-line no-console
      console.error('[Order] Failed to send order-created email:', emailError);
    }

    return sendResponse(res, 201, 'Đơn hàng được tạo thành công', populatedOrder || order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để xem đơn hàng của bạn');
    }

    const { page = 1, limit = 10 } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const total = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Đơn hàng được lấy thành công',
      orders,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('items.product').populate('user');

    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    // Kiểm tra xem người dùng có sở hữu đơn hàng này hay không hoặc là quản trị viên
    if (req.user && req.user.role === 'user' && order.user && order.user._id.toString() !== req.user.id) {
      return sendError(res, 403, 'Bạn không có quyền xem đơn hàng này');
    }

    return sendResponse(res, 200, 'Đơn hàng được lấy thành công', formatOrder(order));
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancelReason = String(req.body?.cancelReason || '').trim();

    if (!cancelReason) {
      return sendError(res, 400, 'Vui lòng cung cấp lý do hủy đơn hàng');
    }

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    // Kiểm tra xem người dùng có sở hữu đơn hàng này hay không
    if (order.user && order.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Bạn không có quyền hủy đơn hàng này');
    }

    if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
      return sendError(res, 400, 'Đơn hàng không thể bị hủy ở giai đoạn này');
    }

    // Khôi phục kho hàng sản phẩm
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason;
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate('items.product').populate('user');

    try {
      await sendOrderCancelledEmail(updatedOrder || order, cancelReason);
    } catch (emailError) {
      // eslint-disable-next-line no-console
      console.error('[Order] Failed to send order-cancelled email:', emailError);
    }

    return sendResponse(res, 200, 'Đơn hàng được hủy thành công', formatOrder(updatedOrder || order));
  } catch (error) {
    next(error);
  }
};
