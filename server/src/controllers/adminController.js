import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import RewardItem from '../models/RewardItem.js';
import RewardRedemption from '../models/RewardRedemption.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination, validateProductData } from '../utils/validators.js';
import News from '../models/News.js'; // Giả định model này tồn tại
import NewsletterSubscription from '../models/NewsletterSubscription.js'; // Giả định model này tồn tại
import sendEmail from '../utils/sendEmail.js'; // Giả định utility này tồn tại
import { calculateEarnedPoints } from '../utils/membership.js';

/**
 * Chuẩn hoá một Order document thành format thống nhất cho admin frontend.
 * - itemCount: số lượng dòng sản phẩm
 * - items: mảng có productName, price, quantity, image
 * - shippingAddress: map từ customerInfo
 * - user: lấy từ order.user (populated) hoặc customerInfo
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

const sendOrderStatusEmail = async (order, status) => {
  const customerEmail = order?.customerInfo?.email || order?.user?.email;
  if (!customerEmail) return;

  const orderId = order?._id?.toString() || order?.id || '';
  const orderCode = `#${orderId}`;
  const orderDetailUrl = `${getClientUrl()}/orders/${orderId}`;
  const cancelFormUrl = `${getClientUrl()}/orders/${orderId}?cancel=1`;

  if (status === 'confirmed') {
    const html = `
      <p>Xin chào ${order?.customerInfo?.fullName || order?.user?.fullName || 'Quý khách'},</p>
      <p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được <strong>xác nhận</strong>.</p>
      <p>Nếu cần hủy đơn, bạn có thể dùng nút bên dưới để mở trang nhập lý do hủy:</p>
      <p style="margin:18px 0;">
        <a href="${cancelFormUrl}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Yêu cầu hủy đơn</a>
      </p>
      <p>Hoặc xem chi tiết đơn hàng tại đây:</p>
      <p style="margin:18px 0;">
        <a href="${orderDetailUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Xem chi tiết đơn hàng</a>
      </p>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `Đơn hàng ${orderCode} đã được xác nhận`,
      html,
    });
    return;
  }

  if (status === 'cancelled') {
    const reason = String(order?.cancelReason || order?.rejectionReason || order?.notes || '').trim();
    const html = `
      <p>Xin chào ${order?.customerInfo?.fullName || order?.user?.fullName || 'Quý khách'},</p>
      <p>Đơn hàng <strong>${orderCode}</strong> đã được cập nhật sang trạng thái <strong>Đã hủy</strong>.</p>
      ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
      <p style="margin:18px 0;">
        <a href="${orderDetailUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Xem chi tiết đơn hàng</a>
      </p>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `Đơn hàng ${orderCode} đã bị hủy`,
      html,
    });
  }
};

// Bảng điều khiển
export const getDashboard = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalBrands = await Brand.countDocuments({ status: 'active' });
    const totalCategories = await Category.countDocuments({ status: 'active' });

    // Tính doanh thu (mô phỏng - trong hệ thống thực sẽ tính tổng các khoản thanh toán thực tế)
    const orders = await Order.find({ status: 'completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Lấy các đơn hàng gần đây
    const recentOrders = await Order.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(5);

    // Lấy thống kê đơn hàng theo trạng thái
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    // Thống kê mã giảm giá coupon
    const allCoupons = await Coupon.find();
    const totalCouponDiscount = await Order.aggregate([
      { $match: { couponCode: { $ne: '' }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$couponDiscount' } } },
    ]);
    const couponStats = {
      totalCoupons: allCoupons.length,
      activeCoupons: allCoupons.filter((c) => c.isActive).length,
      totalUsed: allCoupons.reduce((sum, c) => sum + c.usedCount, 0),
      totalDiscount: totalCouponDiscount[0]?.total || 0,
    };

    const [rewardStatsRow, totalRewardItems] = await Promise.all([
      RewardRedemption.aggregate([
        {
          $group: {
            _id: null,
            totalRedeemedQuantity: { $sum: '$quantity' },
            totalPointsRedeemed: { $sum: '$totalPoints' },
            totalRedeemOrders: { $sum: 1 },
          },
        },
      ]),
      RewardItem.countDocuments({ isActive: true }),
    ]);

    const membershipStats = {
      totalRewardItems,
      totalRedeemedQuantity: rewardStatsRow?.[0]?.totalRedeemedQuantity || 0,
      totalPointsRedeemed: rewardStatsRow?.[0]?.totalPointsRedeemed || 0,
      totalRedeemOrders: rewardStatsRow?.[0]?.totalRedeemOrders || 0,
    };

    return sendResponse(res, 200, 'Dữ liệu bảng điều khiển được lấy thành công', {
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalBrands,
        totalCategories,
        totalRevenue,
      },
      recentOrders,
      orderStats,
      couponStats,
      membershipStats,
    });
  } catch (error) {
    next(error);
  }
};

// Quản lý tin tức
export const createNews = async (req, res, next) => {
  try {
    const { title, content, image, isPublished } = req.body;
    const author = req.user.id; // Lấy từ auth middleware

    const newNews = new News({
      title,
      content,
      image,
      author,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    await newNews.save();

    // Nếu tin tức được xuất bản ngay, gửi email cho người đăng ký
    if (isPublished) {
      try {
        const subscribers = await NewsletterSubscription.find({}, 'email');
        const emails = subscribers.map(sub => sub.email);

        if (emails.length > 0) {
          const subject = `Bài viết mới: ${title}`;
          const newsUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/blog/${newNews._id}`;
          const html = `
            <h1>Bài viết mới từ Salvio Royale!</h1>
            <p>Chúng tôi vừa đăng một bài viết mới mà bạn có thể quan tâm:</p>
            <h2>${title}</h2>
            <p>${content.substring(0, 200)}...</p>
            <a href="${newsUrl}">Đọc thêm</a>
          `;
          // Gửi email cho tất cả người đăng ký. Trong ứng dụng thực tế, đây nên là một background job.
          await sendEmail({ to: emails.join(','), subject, html });
        }
      } catch (emailError) {
        console.error("Lỗi khi gửi email tin tức:", emailError);
      }
    }
    return sendResponse(res, 201, 'Tạo tin tức thành công', newNews);
  } catch (error) {
    next(error);
  }
};

// Quản lý sản phẩm
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, material, images, category, brand, isFeatured, stock, salePercent } = req.body;
    const parsedPrice = Number(price);
    const parsedSalePercent = Math.max(0, Math.min(100, Number(salePercent || 0)));

    const errors = validateProductData(req.body);
    if (errors.length > 0) {
      return sendError(res, 400, errors.join(', '));
    }

    const product = new Product({
      name,
      price: parsedPrice,
      description,
      material,
      images,
      category,
      brand,
      isFeatured: isFeatured || false,
      stock: stock || 0,
      salePercent: parsedSalePercent,
      originalPrice: parsedSalePercent > 0 ? parsedPrice : null,
    });

    await product.save();

    return sendResponse(res, 201, 'Sản phẩm được tạo thành công', product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, material, images, category, brand, isFeatured, stock, isActive, salePercent } =
      req.body;
    const parsedPrice = Number(price);
    const parsedSalePercent = Math.max(0, Math.min(100, Number(salePercent || 0)));

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price: parsedPrice,
        description,
        material,
        images,
        category,
        brand,
        isFeatured,
        stock,
        isActive,
        salePercent: parsedSalePercent,
        originalPrice: parsedSalePercent > 0 ? parsedPrice : null,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    return sendResponse(res, 200, 'Sản phẩm được cập nhật thành công', product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    return sendResponse(res, 200, 'Sản phẩm được xóa thành công');
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const total = await Product.countDocuments();
    const products = await Product.find()
      .populate('category')
      .populate('brand')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Sản phẩm được lấy thành công',
      products,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

// Quản lý đơn hàng
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user')
      .populate('items.product')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Đơn hàng được lấy thành công',
      orders.map(formatOrder),
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'confirmed', 'shipping', 'completed', 'cancelled'].includes(status)) {
      return sendError(res, 400, 'Trạng thái không hợp lệ');
    }

    const order = await Order.findById(id).populate('user').populate('items.product');

    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    const previousStatus = order.status;
    order.status = status;
    if (notes) {
      order.notes = notes;
    }
    if (status === 'cancelled' && notes) {
      order.cancelReason = notes;
    }

    if (status === 'completed' && previousStatus !== 'completed' && order.user?._id) {
      const orderOwner = await User.findById(order.user._id);
      if (orderOwner) {
        const nextTotalSpent = Number(orderOwner.totalSpent || 0) + Number(order.totalPrice || 0);
        const earned = calculateEarnedPoints(order.totalPrice, nextTotalSpent);

        orderOwner.totalSpent = nextTotalSpent;
        orderOwner.loyaltyPoints = Number(orderOwner.loyaltyPoints || 0) + Number(earned.earnedPoints || 0);
        await orderOwner.save();

        order.loyaltyPointsAwarded = Number(earned.earnedPoints || 0);
        order.loyaltyMultiplierApplied = Number(earned.multiplier || 1);
        order.loyaltyRankApplied = earned.level?.rank || 'member';
      }
    }

    await order.save();

    if (status === 'confirmed' || status === 'cancelled') {
      try {
        await sendOrderStatusEmail(order, status);
      } catch (emailError) {
        console.error('[Admin] Lỗi gửi email trạng thái đơn hàng:', emailError);
      }
    }

    return sendResponse(res, 200, 'Trạng thái đơn hàng được cập nhật thành công', formatOrder(order));
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return sendError(res, 400, 'Vui lòng cung cấp lý do từ chối');
    }

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    if (order.status !== 'pending') {
      return sendError(res, 400, 'Chỉ có thể từ chối đơn hàng đang chờ xác nhận');
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
    order.rejectionReason = rejectionReason;
    order.cancelReason = rejectionReason;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('user').populate('items.product');

    try {
      await sendOrderStatusEmail(populatedOrder || order, 'cancelled');
    } catch (emailError) {
      console.error('[Admin] Lỗi gửi email hủy đơn:', emailError);
    }

    return sendResponse(res, 200, 'Đơn hàng đã bị từ chối thành công', populatedOrder || order);
  } catch (error) {
    next(error);
  }
};

// Quản lý người dùng
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const filter = {};
    if (role) {
      filter.role = role;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Người dùng được lấy thành công',
      users,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');

    if (!user) {
      return sendError(res, 404, 'Người dùng không tìm thấy');
    }

    return sendResponse(res, 200, 'Trạng thái người dùng được cập nhật thành công', user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 400, 'Vai trò không hợp lệ');
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');

    if (!user) {
      return sendError(res, 404, 'Người dùng không tìm thấy');
    }

    return sendResponse(res, 200, 'Vai trò người dùng được cập nhật thành công', user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Không cho phép xóa các tài khoản admin qua API
    const user = await User.findById(id);
    if (user && user.role === 'admin') {
      return sendError(res, 403, 'Không thể xóa tài khoản admin');
    }

    await User.findByIdAndDelete(id);

    return sendResponse(res, 200, 'Người dùng được xóa thành công');
  } catch (error) {
    next(error);
  }
};
