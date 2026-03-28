import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';

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

    // Xóa giỏ hàng nếu người dùng đã đăng nhập
    if (req.user) {
      const cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    }

    return sendResponse(res, 201, 'Đơn hàng được tạo thành công', order);
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

    return sendResponse(res, 200, 'Đơn hàng được lấy thành công', order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'Đơn hàng không tìm thấy');
    }

    // Kiểm tra xem người dùng có sở hữu đơn hàng này hay không
    if (order.user && order.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Bạn không có quyền hủy đơn hàng này');
    }

    if (!['pending', 'processing'].includes(order.status)) {
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
    await order.save();

    return sendResponse(res, 200, 'Đơn hàng được hủy thành công', order);
  } catch (error) {
    next(error);
  }
};
