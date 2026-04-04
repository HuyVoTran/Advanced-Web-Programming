import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { calculateCouponDiscount } from './couponController.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';
import sendEmail from '../utils/sendEmail.js';
import { getMembershipLevelBySpent } from '../utils/membership.js';

const RANK_ORDER = {
  member: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  diamond: 4,
};

const isRankEligible = (currentRank = 'member', requiredRank = 'all') => {
  if (!requiredRank || requiredRank === 'all') return true;
  const current = RANK_ORDER[String(currentRank || 'member').toLowerCase()] ?? 0;
  const required = RANK_ORDER[String(requiredRank || 'member').toLowerCase()] ?? 0;
  return current >= required;
};

/**
 * Transform một Order document thành format chuẩn cho frontend.
 */
const formatOrder = (order) => {
  const o = order.toObject ? order.toObject() : order;

  const items = (o.items || []).map((item) => ({
    productId: item.product?._id || item.product,
    productName: item.product?.name || 'Sản phẩm không còn tồn tại',
    price: item.price,
    originalPrice: item.originalPrice ?? item.price,
    salePercent: item.salePercent ?? 0,
    discountAmount: item.discountAmount ?? 0,
    finalPrice: item.finalPrice ?? item.price,
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
    totalOriginalPrice:
      o.totalOriginalPrice ??
      items.reduce((sum, item) => sum + Number(item.originalPrice || item.price || 0) * Number(item.quantity || 0), 0),
    totalDiscount:
      o.totalDiscount ??
      items.reduce((sum, item) => sum + Number(item.discountAmount || 0) * Number(item.quantity || 0), 0),
    couponCode: o.couponCode || '',
    couponDiscount: o.couponDiscount || 0,
    loyaltyPointsAwarded: Number(o.loyaltyPointsAwarded || 0),
    loyaltyMultiplierApplied: Number(o.loyaltyMultiplierApplied || 1),
    loyaltyRankApplied: o.loyaltyRankApplied || 'member',
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

const clampSalePercent = (value = 0) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
};

const roundPriceToStep = (value, step = 1000) => {
  const numericValue = Number(value);
  const numericStep = Number(step);
  const safeValue = Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
  const safeStep = Number.isFinite(numericStep) && numericStep > 0 ? numericStep : 1000;
  return Math.max(0, Math.round(safeValue / safeStep) * safeStep);
};

const calculateDiscountedPrice = (basePrice, salePercent) => {
  const normalizedBasePrice = Number.isFinite(Number(basePrice)) ? Math.max(0, Number(basePrice)) : 0;
  const normalizedSalePercent = clampSalePercent(salePercent);

  if (normalizedSalePercent <= 0) {
    return roundPriceToStep(normalizedBasePrice);
  }

  return roundPriceToStep(normalizedBasePrice * (1 - normalizedSalePercent / 100));
};

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
    const { customerInfo, items, paymentMethod, notes, couponCode } = req.body;

    // Xác thực
    if (!customerInfo || !items || items.length === 0) {
      return sendError(res, 400, 'Vui lòng cung cấp thông tin khách hàng và các mục');
    }

    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      return sendError(res, 400, 'Vui lòng cung cấp thông tin khách hàng đầy đủ');
    }

    // Xác minh các mục và tính tổng cộng
    let totalPrice = 0;
    let totalOriginalPrice = 0;
    let totalDiscount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return sendError(res, 404, `Sản phẩm với ID ${item.productId} không tìm thấy`);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Hàng không đủ cho ${product.name}`);
      }

      const originalPrice = Number(product.originalPrice || product.price || 0);
      const salePercent = clampSalePercent(product.salePercent || 0);
      const finalPrice = calculateDiscountedPrice(originalPrice, salePercent);
      const discountAmount = Math.max(0, originalPrice - finalPrice);

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: finalPrice,
        originalPrice,
        salePercent,
        discountAmount,
        finalPrice,
      });

      totalPrice += finalPrice * item.quantity;
      totalOriginalPrice += originalPrice * item.quantity;
      totalDiscount += discountAmount * item.quantity;

      // Giảm kho hàng
      product.stock -= item.quantity;
      await product.save();
    }

    // Áp dụng mã giảm giá coupon
    let appliedCouponCode = '';
    let couponDiscount = 0;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });

      let isEligible = false;

      if (coupon && coupon.requiredRank && coupon.requiredRank !== 'all') {
        if (!req.user) {
          return sendError(res, 400, 'Mã giảm giá này yêu cầu đăng nhập tài khoản thành viên');
        }
        const currentRank = getMembershipLevelBySpent(Number(req.user.totalSpent || 0)).rank;
        if (!isRankEligible(currentRank, coupon.requiredRank)) {
          return sendError(
            res,
            400,
            `Mã giảm giá yêu cầu hạng từ ${String(coupon.requiredRank).toUpperCase()} trở lên`
          );
        }
      }

      if (coupon && coupon.oneTimePerUser) {
        if (!req.user) {
          return sendError(res, 400, 'Mã giảm giá này chỉ dùng 1 lần cho mỗi tài khoản. Vui lòng đăng nhập.');
        }

        const alreadyUsed = await Order.exists({
          user: req.user.id,
          couponCode: coupon.code,
          status: { $ne: 'cancelled' },
        });
        if (alreadyUsed) {
          return sendError(res, 400, 'Tài khoản của bạn đã sử dụng mã giảm giá này');
        }
      }

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date()) &&
        (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) &&
        (coupon.minOrderAmount === 0 || totalPrice >= coupon.minOrderAmount)
      ) {
        isEligible = true;
      }

      if (isEligible) {
        couponDiscount = calculateCouponDiscount(coupon, totalPrice);
        appliedCouponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const finalTotalPrice = Math.max(0, totalPrice - couponDiscount);

    // Tạo đơn hàng
    const order = new Order({
      user: req.user ? req.user.id : null,
      customerInfo,
      items: orderItems,
      totalPrice: finalTotalPrice,
      totalOriginalPrice,
      totalDiscount,
      couponCode: appliedCouponCode,
      couponDiscount,
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

    const requesterId = String(req.user?._id || req.user?.id || '');
    const ownerId = order.user ? String(order.user?._id || order.user) : '';
    const isAdmin = req.user?.role === 'admin';

    // Kiểm tra xem người dùng có sở hữu đơn hàng này hay không
    if (ownerId && ownerId !== requesterId && !isAdmin) {
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
