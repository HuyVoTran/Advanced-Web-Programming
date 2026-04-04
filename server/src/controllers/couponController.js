import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { sendResponse, sendError } from '../utils/response.js';
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

const checkCouponEligibility = async ({ coupon, orderTotal, user }) => {
  if (!coupon) {
    return 'Mã giảm giá không hợp lệ';
  }

  if (!coupon.isActive) {
    return 'Mã giảm giá đã bị vô hiệu hóa';
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return 'Mã giảm giá đã hết hạn';
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return 'Mã giảm giá đã hết lượt sử dụng';
  }

  const total = Number(orderTotal || 0);
  if (coupon.minOrderAmount > 0 && total < coupon.minOrderAmount) {
    return `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(coupon.minOrderAmount)} VNĐ để áp dụng mã này`;
  }

  const requiredRank = String(coupon.requiredRank || 'all').toLowerCase();
  if (requiredRank !== 'all') {
    if (!user) {
      return 'Mã giảm giá này yêu cầu đăng nhập tài khoản thành viên';
    }

    const currentRank = getMembershipLevelBySpent(Number(user.totalSpent || 0)).rank;
    if (!isRankEligible(currentRank, requiredRank)) {
      return `Mã giảm giá yêu cầu hạng từ ${requiredRank.toUpperCase()} trở lên`;
    }
  }

  if (coupon.oneTimePerUser) {
    if (!user) {
      return 'Mã giảm giá này chỉ dùng 1 lần cho mỗi tài khoản. Vui lòng đăng nhập.';
    }

    const alreadyUsed = await Order.exists({
      user: user._id || user.id,
      couponCode: coupon.code,
      status: { $ne: 'cancelled' },
    });

    if (alreadyUsed) {
      return 'Tài khoản của bạn đã sử dụng mã giảm giá này';
    }
  }

  return null;
};

/**
 * Tính số tiền giảm giá dựa trên coupon và tổng đơn hàng.
 */
export const calculateCouponDiscount = (coupon, orderTotal) => {
  const total = Number(orderTotal || 0);
  if (coupon.discountType === 'percent') {
    const discount = Math.round((total * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0) {
      return Math.min(discount, coupon.maxDiscount);
    }
    return discount;
  }
  // fixed
  return Math.min(coupon.discountValue, total);
};

/**
 * Kiểm tra và trả về thông tin coupon (public - dùng khi checkout).
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || typeof code !== 'string') {
      return sendError(res, 400, 'Vui lòng cung cấp mã giảm giá');
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    const reason = await checkCouponEligibility({
      coupon,
      orderTotal,
      user: req.user || null,
    });
    if (reason) {
      return sendError(res, 400, reason);
    }

    const discountAmount = calculateCouponDiscount(coupon, orderTotal);

    return sendResponse(res, 200, 'Mã giảm giá hợp lệ', {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
      requiredRank: coupon.requiredRank || 'all',
      oneTimePerUser: Boolean(coupon.oneTimePerUser),
      discountAmount,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────── ADMIN ───────────────────────────

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, 'Lấy danh sách mã giảm giá thành công', coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      requiredRank,
      oneTimePerUser,
      isActive,
      expiresAt,
    } = req.body;

    if (!code || !discountValue) {
      return sendError(res, 400, 'Mã coupon và giá trị giảm là bắt buộc');
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return sendError(res, 400, 'Mã coupon đã tồn tại');
    }

    const coupon = new Coupon({
      code: code.trim().toUpperCase(),
      description: description || '',
      discountType: discountType || 'percent',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscount: Number(maxDiscount || 0),
      usageLimit: Number(usageLimit || 0),
      requiredRank: String(requiredRank || 'all').toLowerCase(),
      oneTimePerUser: Boolean(oneTimePerUser),
      isActive: isActive !== false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await coupon.save();
    return sendResponse(res, 201, 'Tạo mã giảm giá thành công', coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    if (updates.requiredRank) {
      updates.requiredRank = String(updates.requiredRank).toLowerCase();
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'oneTimePerUser')) {
      updates.oneTimePerUser = Boolean(updates.oneTimePerUser);
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!coupon) {
      return sendError(res, 404, 'Mã giảm giá không tìm thấy');
    }

    return sendResponse(res, 200, 'Cập nhật mã giảm giá thành công', coupon);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return sendError(res, 404, 'Mã giảm giá không tìm thấy');
    }
    return sendResponse(res, 200, 'Xóa mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thống kê coupon cho admin dashboard.
 */
export const getCouponStats = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

    return sendResponse(res, 200, 'Lấy thống kê coupon thành công', {
      totalCoupons,
      activeCoupons,
      totalUsed,
    });
  } catch (error) {
    next(error);
  }
};
