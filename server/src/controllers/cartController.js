import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { sendResponse, sendError } from '../utils/response.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    return sendResponse(res, 200, 'Giỏ hàng được lấy thành công', cart);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return sendError(res, 400, 'Vui lòng cung cấp sản phẩm và số lượng hợp lệ');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    if (product.stock < quantity) {
      return sendError(res, 400, 'Hàng không đủ');
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      if (product.stock < existingItem.quantity + quantity) {
        return sendError(res, 400, 'Hàng không đủ');
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    await cart.populate('items.product');

    return sendResponse(res, 200, 'Sản phẩm được thêm vào giỏ hàng', cart);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return sendError(res, 400, 'Vui lòng cung cấp số lượng hợp lệ');
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Cart not found');
    }

    const cartItem = cart.items.find((item) => item._id.toString() === itemId);

    if (!cartItem) {
      return sendError(res, 404, 'Mục giỏ hàng không tìm thấy');
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    } else {
      const product = await Product.findById(cartItem.product);
      if (product.stock < quantity) {
        return sendError(res, 400, 'Hàng không đủ');
      }
      cartItem.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');

    return sendResponse(res, 200, 'Giỏ hàng được cập nhật thành công', cart);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Giỏ hàng không tìm thấy');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();
    await cart.populate('items.product');

    return sendResponse(res, 200, 'Mục được xóa khỏi giỏ hàng', cart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 404, 'Giỏ hàng không tìm thấy');
    }

    cart.items = [];
    await cart.save();

    return sendResponse(res, 200, 'Giỏ hàng được xóa thành công', cart);
  } catch (error) {
    next(error);
  }
};
